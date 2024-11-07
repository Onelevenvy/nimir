from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Body, HTTPException, Query
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.annotation import Annotation, AnnotationCreate, AnnotationOut
from app.models.data import Data
from app.models.workflow import WorkflowNodeExecution

router = APIRouter()


@router.get("/data/{data_id}", response_model=List[AnnotationOut])
def read_annotations_by_data(
    data_id: int,
    session: SessionDep,
) -> Any:
    """获取某个数据的标注"""
    data = session.get(Data, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    annotations = session.exec(
        select(Annotation).where(Annotation.data_id == data_id)
    ).all()

    return annotations


@router.post("/data/{data_id}", response_model=List[AnnotationOut])
def update_data_annotations(
    data_id: int,
    annotations: List[AnnotationCreate],
    session: SessionDep,
    processing_stage: str = Query(..., description="处理阶段"),
    workflow_execution_id: Optional[int] = None,
    node_execution_id: Optional[int] = None,
) -> Any:
    """更新数据的标注"""
    data = session.get(Data, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    try:
        # 删除现有的同阶段标注
        existing_annotations = session.exec(
            select(Annotation).where(
                Annotation.data_id == data_id,
                Annotation.processing_stage == processing_stage,
            )
        ).all()
        for ann in existing_annotations:
            session.delete(ann)

        # 添加新标注
        new_annotations = []
        for ann in annotations:
            db_ann = Annotation(
                type=ann.type,
                points=ann.points,
                color=ann.color,
                label_id=ann.label_id,
                data_id=data_id,
                project_id=data.project_id,
                labelme_data=ann.labelme_data,
                processing_stage=processing_stage,
                workflow_execution_id=workflow_execution_id,
                node_execution_id=node_execution_id,
            )
            session.add(db_ann)
            new_annotations.append(db_ann)

        session.commit()
        return new_annotations
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/workflow/{workflow_execution_id}/{node_id}")
def get_annotations_by_workflow_node(
    workflow_execution_id: int,
    node_id: str,
    session: SessionDep,
    category: Optional[str] = None,
) -> List[Dict]:
    """获取工作流特定节点的数据标注"""
    # 查找节点执行记录
    node_execution = session.exec(
        select(WorkflowNodeExecution).where(
            WorkflowNodeExecution.execution_id == workflow_execution_id,
            WorkflowNodeExecution.node_id == node_id,
        )
    ).first()

    if not node_execution:
        raise HTTPException(status_code=404, detail="Node execution not found")

    # 构建数据查询
    query = select(Data).where(
        Data.workflow_execution_id == workflow_execution_id,
        Data.node_execution_id == node_execution.id,
    )

    if category:
        query = query.where(Data.category == category)

    # 获取数据及其标注
    results = []
    for data in session.exec(query).all():
        annotations = session.exec(
            select(Annotation).where(Annotation.data_id == data.data_id)
        ).all()

        results.append(
            {
                "data_id": data.data_id,
                "path": data.path,
                "category": data.category,
                "processing_stage": data.processing_stage,
                "annotations": [ann.model_dump() for ann in annotations],
            }
        )

    return results


@router.get("/project/{project_id}/stage/{stage}")
def get_annotations_by_stage(
    project_id: int,
    stage: str,
    session: SessionDep,
    workflow_execution_id: Optional[int] = None,
    category: Optional[str] = None,
) -> List[Dict]:
    """获取项目特定处理阶段的标注"""
    query = select(Data).where(
        Data.project_id == project_id, Data.processing_stage == stage
    )

    if workflow_execution_id:
        query = query.where(Data.workflow_execution_id == workflow_execution_id)
    if category:
        query = query.where(Data.category == category)

    results = []
    for data in session.exec(query).all():
        annotations = session.exec(
            select(Annotation).where(Annotation.data_id == data.data_id)
        ).all()

        results.append(
            {
                "data_id": data.data_id,
                "path": data.path,
                "category": data.category,
                "processing_stage": data.processing_stage,
                "annotations": [ann.model_dump() for ann in annotations],
            }
        )

    return results


@router.delete("/data/{data_id}")
def delete_data_annotations(
    data_id: int,
    session: SessionDep,
) -> Dict:
    """删除数据的所有标注"""
    data = session.get(Data, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    try:
        annotations = session.exec(
            select(Annotation).where(Annotation.data_id == data_id)
        ).all()

        for ann in annotations:
            session.delete(ann)

        session.commit()
        return {"message": f"Successfully deleted {len(annotations)} annotations"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
