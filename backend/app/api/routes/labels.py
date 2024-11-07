from typing import Any, List, Dict, Optional
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlmodel import Session, select
import numpy as np

from app.api.deps import SessionDep
from app.models.annotation import Annotation
from app.models.label import Label, LabelCreate, LabelOut, LabelUpdate
from app.models.project import Project
from app.utils.label_utils import rand_hex_color

router = APIRouter()


def unique_within_project(
    session: Session,
    project_id: int,
    new_labels: List[LabelCreate],
    col_names=["id", "name"],
) -> tuple[np.ndarray, np.ndarray]:
    """检查标签在项目内是否唯一"""
    labels = session.exec(select(Label).where(Label.project_id == project_id)).all()
    rets = []
    for column_name in col_names:
        results = [True] * len(new_labels)
        curr_values = set(getattr(label, column_name) for label in labels)
        new_values = set()
        for idx, new_label in enumerate(new_labels):
            new_value = getattr(new_label, column_name)
            if new_value in curr_values or new_value in new_values:
                results[idx] = False
            new_values.add(new_value)
        rets.append(results)
    rets = np.array(rets)
    unique = np.all(rets, axis=0)
    return rets, unique


def pre_add(session: Session, new_label: LabelCreate) -> LabelCreate:
    """标签添加前的预处理"""
    if new_label.project_id is None:
        raise HTTPException(status_code=400, detail="Must specify project_id")
    
    project = session.get(Project, new_label.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if new_label.color is None:
        colors = session.exec(
            select(Label.color).where(Label.project_id == new_label.project_id)
        ).all()
        new_label.color = rand_hex_color(colors)

    cols = ["name"]
    rets, unique = unique_within_project(
        session, new_label.project_id, [new_label], cols
    )
    if not unique[0]:
        not_unique_cols = ", ".join([c for c, u in zip(cols, rets[0]) if not u])
        raise HTTPException(
            status_code=409, detail=f"Label {not_unique_cols} is not unique"
        )

    return new_label


@router.get("/", response_model=List[LabelOut])
def read_all_labels(session: SessionDep) -> Any:
    """获取所有标签"""
    labels = session.exec(select(Label)).all()
    return labels


@router.post("/", response_model=LabelOut)
def create_label(
    *,
    session: SessionDep,
    label_in: LabelCreate,
    remove_duplicate_by_name: bool = Header(False),
) -> Any:
    """创建新标签"""
    if remove_duplicate_by_name:
        existing_labels = session.exec(
            select(Label).where(Label.project_id == label_in.project_id)
        ).all()
        if label_in.name.strip() in {l.name.strip() for l in existing_labels}:
            raise HTTPException(
                status_code=409, detail="Label with this name already exists"
            )

    try:
        label_in = pre_add(session, label_in)
        label = Label.model_validate(label_in)
        session.add(label)
        session.commit()
        session.refresh(label)
        return label
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{label_id}", response_model=LabelOut)
def read_label(label_id: int, session: SessionDep) -> Any:
    """获取标签详情"""
    label = session.get(Label, label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")
    return label


@router.put("/{label_id}", response_model=LabelOut)
def update_label(
    *,
    session: SessionDep,
    label_id: int,
    label_in: LabelUpdate,
) -> Any:
    """更新标签"""
    label = session.get(Label, label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")

    try:
        update_data = label_in.model_dump(exclude_unset=True)
        
        # 检查名称唯一性
        if "name" in update_data:
            existing = session.exec(
                select(Label).where(
                    Label.project_id == label.project_id,
                    Label.name == update_data["name"],
                    Label.label_id != label_id
                )
            ).first()
            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="Label with this name already exists in the project"
                )
        
        for field, value in update_data.items():
            setattr(label, field, value)
            
        session.add(label)
        session.commit()
        session.refresh(label)
        return label
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{label_id}", response_model=LabelOut)
def delete_label(*, session: SessionDep, label_id: int) -> Any:
    """删除标签"""
    label = session.get(Label, label_id)
    if not label:
        raise HTTPException(status_code=404, detail="Label not found")

    try:
        # 检查是否有使用此标签的标注
        annotations = session.exec(
            select(Annotation).where(Annotation.label_id == label_id)
        ).all()
        if annotations:
            raise HTTPException(
                status_code=409,
                detail=f"Can't delete label {label.name} with annotation record",
            )

        # 检查是否有使用此标签作为父类别的标签
        sub_categories = session.exec(
            select(Label).where(
                Label.super_category_id == label_id,
                Label.project_id == label.project_id
            )
        ).all()
        if sub_categories:
            raise HTTPException(
                status_code=409,
                detail=f"Can't delete label {label.name} which is super category to other labels",
            )

        session.delete(label)
        session.commit()
        return label
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/project/{project_id}", response_model=List[LabelOut])
def read_labels_by_project(project_id: int, session: SessionDep) -> Any:
    """获取项目的所有标签"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    labels = session.exec(select(Label).where(Label.project_id == project_id)).all()
    return labels


@router.delete("/project/{project_id}")
def delete_project_labels(project_id: int, session: SessionDep) -> Dict:
    """删除项目的所有标签"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        # 检查是否有标注使用这些标签
        labels = session.exec(select(Label).where(Label.project_id == project_id)).all()
        for label in labels:
            annotations = session.exec(
                select(Annotation).where(Annotation.label_id == label.label_id)
            ).all()
            if annotations:
                raise HTTPException(
                    status_code=409,
                    detail=f"Can't delete label {label.name} with annotation record"
                )
        
        # 删除所有标签
        for label in labels:
            session.delete(label)
            
        session.commit()
        return {"message": "Labels deleted successfully"}
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project/{project_id}/batch")
def batch_create_project_labels(
    project_id: int,
    labels: List[LabelCreate],
    session: SessionDep,
) -> List[LabelOut]:
    """批量创建项目标签"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    try:
        # 检查所有标签名称的唯一性
        existing_labels = session.exec(
            select(Label).where(Label.project_id == project_id)
        ).all()
        existing_names = {l.name.strip() for l in existing_labels}
        
        new_names = set()
        for label in labels:
            if label.name.strip() in existing_names or label.name.strip() in new_names:
                raise HTTPException(
                    status_code=409,
                    detail=f"Label name '{label.name}' already exists"
                )
            new_names.add(label.name.strip())
            
        # 创建新标签
        created_labels = []
        for label_in in labels:
            label_in.project_id = project_id
            if not label_in.color:
                label_in.color = rand_hex_color([l.color for l in existing_labels + created_labels])
                
            label = Label.model_validate(label_in)
            session.add(label)
            created_labels.append(label)
            
        session.commit()
        return created_labels
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))
