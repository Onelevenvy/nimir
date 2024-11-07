# backend/app/core/workflow/data_manager.py

from pathlib import Path
from typing import Optional, Dict, Union, List
from app.api.deps import SessionDep
from app.models.project import Project
import cv2
from datetime import datetime, timezone
from app.core.config import settings
from app.models.workflow import ProcessedData
from app.models.data import Data
from app.models.task import Task
from sqlmodel import select
import os


class WorkflowDataManager:
    def __init__(self, project_id: int, execution_id: int, session: SessionDep):
        self.project_id = project_id
        self.execution_id = execution_id
        self.session = session
        # 获取项目信息
        self.project = session.get(Project, project_id)
        if not self.project:
            raise ValueError(f"Project not found with ID: {project_id}")
        # 使用项目的实际路径
        self.base_path = Path(self.project.data_dir)

    def get_node_data_path(self, node_id: str, node_type: str) -> Path:
        """获取节点数据存储路径 - 不包含 data/ 前缀"""
        if node_type == "image_source":
            return Path("original")
        elif node_type == "preprocess":
            return Path("preprocessed")
        else:
            return Path(f"results/{node_type}")

    def ensure_dir(self, path: Path) -> None:
        """确保目录存在"""
        full_path = self.base_path / "data" / path  # 添加 data/ 到物理路径
        full_path.mkdir(parents=True, exist_ok=True)

    def save_processed_data(
        self,
        node_execution_id: int,
        original_data_id: int,
        data: bytes,
        filename: str,
        file_path: str,
        node_type: str,
        node_id: str,
        metadata_: Dict = None,
    ) -> ProcessedData:
        """保存处理后的数据"""
        processed_data = ProcessedData(
            node_execution_id=node_execution_id,
            original_data_id=original_data_id,
            file_path=file_path,
            metadata_={
                **(metadata_ or {}),
                "node_id": node_id,
                "node_type": node_type
            }
        )
        return processed_data

    def get_processed_data(
        self, file_path: Union[str, Path], as_array: bool = False
    ) -> Union[bytes, str, None]:
        """获取处理后的数据"""
        full_path = self.base_path / "data" / file_path  # 添加 data/ 到物理路径
        if not full_path.exists():
            return None

        if as_array and full_path.suffix.lower() in [".jpg", ".jpeg", ".png", ".bmp"]:
            return cv2.imread(str(full_path))

        return full_path.read_bytes()

    def get_relative_path(self, full_path: Union[str, Path]) -> str:
        """获取相对于项目数据目录的路径"""
        return str(Path(full_path).relative_to(self.base_path / "data"))  # 移除 data/ 前缀

    def get_data_by_stage(
        self, 
        stage: str, 
        workflow_execution_id: Optional[int] = None,
        category: Optional[str] = None
    ) -> List[Data]:
        """获取特定处理阶段的数据"""
        query = select(Data).where(
            Data.project_id == self.project_id,
            Data.processing_stage == stage
        )
        
        if workflow_execution_id:
            query = query.where(Data.workflow_execution_id == workflow_execution_id)
            
        if category:
            query = query.where(Data.category == category)
            
        return self.session.exec(query).all()
