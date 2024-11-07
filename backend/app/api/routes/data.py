import mimetypes
import os
import logging
import traceback
from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
from sqlmodel import select

from app.api.deps import SessionDep
from app.models.data import Data
from app.models.project import Project
from app.models.workflow import ProcessedData, WorkflowNodeExecution, WorkflowExecution
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/{data_id}/image", response_class=FileResponse)
async def read_original_image(
    data_id: int,
    session: SessionDep,
) -> FileResponse:
    """获取原始图像"""
    data = session.get(Data, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    project = session.get(Project, data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = os.path.join(project.data_dir, "data", data.path)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, detail=f"Image file not found: {data.path}"
        )

    try:
        mime_type = mimetypes.guess_type(file_path)[0] or "application/octet-stream"
        return FileResponse(
            path=file_path, filename=os.path.basename(file_path), media_type=mime_type
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error accessing file: {str(e)}")


@router.get("/preprocessed/{data_id}/image", response_class=FileResponse)
async def read_processed_image(
    data_id: int,
    session: SessionDep,
) -> FileResponse:
    """获取处理后的图像"""
    try:
        logger.info(f"Reading processed image for data_id: {data_id}")

        processed_data = session.get(ProcessedData, data_id)
        if not processed_data:
            raise HTTPException(status_code=404, detail="Processed data not found")

        # 构建完整的文件路径
        if processed_data.file_path.startswith(("preprocessed/", "results/")):
            file_path = os.path.join(
                settings.DATA_ROOT_PATH, "data", processed_data.file_path
            )
        else:
            raise HTTPException(
                status_code=400, detail="Invalid processed data path format"
            )

        abs_file_path = os.path.abspath(file_path)
        if not os.path.exists(abs_file_path):
            raise HTTPException(
                status_code=404,
                detail=f"Processed image file not found: {processed_data.file_path}",
            )

        mime_type = mimetypes.guess_type(abs_file_path)[0] or "application/octet-stream"
        return FileResponse(
            path=abs_file_path,
            filename=os.path.basename(abs_file_path),
            media_type=mime_type,
        )
    except Exception as e:
        logger.error(f"Error in read_processed_image: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error accessing file: {str(e)}")


@router.get("/workflow/{workflow_execution_id}/{stage}")
async def get_processed_data_by_stage(
    workflow_execution_id: int,
    stage: str,
    session: SessionDep,
    category: Optional[str] = None,
    node_id: Optional[str] = None,
) -> List[Dict]:
    """获取特定处理阶段的数据"""
    query = select(Data).where(
        Data.workflow_execution_id == workflow_execution_id,
        Data.processing_stage == stage,
    )

    if category:
        query = query.where(Data.category == category)

    if node_id:
        node_execution = session.exec(
            select(WorkflowNodeExecution).where(
                WorkflowNodeExecution.execution_id == workflow_execution_id,
                WorkflowNodeExecution.node_id == node_id,
            )
        ).first()
        if node_execution:
            query = query.where(Data.node_execution_id == node_execution.id)

    data = session.exec(query).all()
    return [
        {
            **d.model_dump(),
            "processed_data": [
                p.model_dump()
                for p in session.exec(
                    select(ProcessedData).where(
                        ProcessedData.original_data_id == d.data_id
                    )
                ).all()
            ],
        }
        for d in data
    ]


@router.get("/metadata/{data_id}")
async def get_data_metadata(
    data_id: int,
    session: SessionDep,
) -> Dict:
    """获取数据的元数据"""
    data = session.get(Data, data_id)
    if not data:
        raise HTTPException(status_code=404, detail="Data not found")

    processed_data = session.exec(
        select(ProcessedData).where(ProcessedData.original_data_id == data_id)
    ).all()

    return {
        "data": data.metadata_,
        "processed_versions": [
            {
                "id": p.id,
                "file_path": p.file_path,
                "metadata": p.metadata_,
                "created_at": p.created_at,
            }
            for p in processed_data
        ],
    }


@router.get("/project/{project_id}/stage/{stage}")
async def get_project_stage_data(
    project_id: int,
    stage: str,
    session: SessionDep,
    category: Optional[str] = None,
    workflow_execution_id: Optional[int] = None,
    node_type: Optional[str] = None,
) -> List[Dict]:
    """获取项目特定处理阶段的数据"""
    # 首先获取最新的工作流执行记录
    latest_execution = None
    if node_type:
        latest_execution = session.exec(
            select(WorkflowNodeExecution)
            .where(
                WorkflowNodeExecution.node_type == node_type,
                WorkflowNodeExecution.status == "completed",
                WorkflowNodeExecution.execution_id.in_(
                    select(WorkflowExecution.execution_id).where(
                        WorkflowExecution.project_id == project_id,
                        WorkflowExecution.status == "completed",
                    )
                ),
            )
            .order_by(WorkflowNodeExecution.completed_at.desc())
        ).first()

    # 构建查询
    if stage == "original":
        query = select(Data).where(
            Data.project_id == project_id, Data.processing_stage == stage
        )
    else:
        query = select(Data).where(
            Data.project_id == project_id,
            Data.processing_stage == stage,
        )

    data = session.exec(query).all()

    return [
        {
            "data_id": d.data_id,
            "path": d.path,
            "metadata_": d.metadata_,
            "original_data_id": d.original_data_id,
        }
        for d in data
    ]


@router.get("/preprocessed/{data_id}/metadata")
def read_processed_metadata(data_id: int, session: SessionDep):
    """获取处理后的数据元数据"""
    processed_data = session.get(ProcessedData, data_id)
    if not processed_data:
        raise HTTPException(status_code=404, detail="Processed data not found")
    return processed_data.metadata_


@router.get("/preprocessed/{data_id}/image", response_class=FileResponse)
def read_processed_image(data_id: int, session: SessionDep):
    """获取处理后的图片"""
    processed_data = session.get(ProcessedData, data_id)
    if not processed_data:
        raise HTTPException(status_code=404, detail="Processed data not found")

    project = session.get(Project, processed_data.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = os.path.join(project.data_dir, "data", processed_data.file_path)
    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404, detail=f"Image file not found: {processed_data.file_path}"
        )

    # 返回处理后的图片
    return FileResponse(
        file_path, media_type="image/jpeg", filename=processed_data.filename
    )
