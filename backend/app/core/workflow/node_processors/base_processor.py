# backend/app/core/workflow/node_processors/base_processor.py

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Tuple, Optional
import cv2
from pathlib import Path
from app.models.workflow import ProcessedData, WorkflowNodeExecution, NodeStatus
from app.core.workflow.data_manager import WorkflowDataManager
from sqlmodel import Session, select
from app.models.data import Data
from app.models.task import Task
import numpy as np
import os
import traceback


class BaseNodeProcessor(ABC):
    def __init__(
        self,
        node_execution: WorkflowNodeExecution,
        session: Session,
        data_manager: WorkflowDataManager,
    ):
        self.node_execution = node_execution
        self.session = session
        self.data_manager = data_manager

    def get_or_create_task(self) -> Task:
        """获取或创建默认任务"""
        task = self.session.exec(
            select(Task).where(Task.project_id == self.data_manager.project.project_id)
        ).first()

        if not task:
            task = Task(
                project_id=self.data_manager.project.project_id, set=0  # 默认为训练集
            )
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)

        return task

    async def clean_old_data(self):
        """清理旧的数据记录，只保留每个节点ID对应的最新数据"""
        try:
            # 使用节点ID作为processing_stage
            old_data = self.session.exec(
                select(Data)
                .where(
                    Data.project_id == self.data_manager.project_id,
                    Data.processing_stage
                    == self.node_execution.node_id,  # 使用node_id而不是node_type
                    Data.node_execution_id != self.node_execution.id,
                )
                .order_by(Data.created.desc())
            ).all()

            if old_data:
                for data in old_data:
                    self.session.delete(data)

                self.session.commit()
                print(
                    f"Cleaned {len(old_data)} old data records for node: {self.node_execution.node_id}"
                )
            else:
                print(
                    f"No old data records found for node: {self.node_execution.node_id}"
                )

        except Exception as e:
            self.session.rollback()
            print(f"Error cleaning old data: {str(e)}")
            raise e

    @abstractmethod
    async def process(self) -> List[int]:
        """处理节点并返回输出数据ID列表"""
        try:
            # 清理旧数据
            await self.clean_old_data()

            # 加载输入数据
            input_data = await self.load_input_data()
            print(
                f"\n=== Processing {len(input_data)} images for {self.node_execution.node_id} ==="
            )
            print(f"Node config: {self.node_execution.config}")

            # 具体的处理逻辑由子类实现
            return []

        except Exception as e:
            print(f"Error in process method: {str(e)}")
            import traceback

            traceback.print_exc()
            raise

    @abstractmethod
    async def train(self, **kwargs):
        """训练功能"""
        pass

    async def load_input_data(self) -> List[Tuple[int, np.ndarray, str]]:
        """加载输入数据"""
        input_data = []
        print(f"\n=== Loading input data for {self.node_execution.node_id} ===")
        print(f"Input data IDs: {self.node_execution.input_data_ids}")

        # 确保从数据库获取完整的节点执行记录
        self.node_execution = self.session.get(WorkflowNodeExecution, self.node_execution.id)

        for data_id in self.node_execution.input_data_ids:
            try:
                if self.node_execution.node_type == "preprocess":
                    # 预处理节点：从 ProcessedData 获取原始数据ID，然后查询原始数据
                    processed_data = self.session.get(ProcessedData, data_id)
                    if not processed_data:
                        print(f"No ProcessedData found for ID: {data_id}")
                        continue
                    
                    data = self.session.get(Data, processed_data.original_data_id)
                    if not data:
                        print(f"No original Data found for ID: {processed_data.original_data_id}")
                        continue
                else:
                    # 其他节点：直接使用 Data 表中的记录
                    data = self.session.get(Data, data_id)
                    if not data:
                        print(f"No Data record found for ID: {data_id}")
                        continue

                print(f"Loading data: {data.path}")
                img_path = os.path.join(
                    self.data_manager.project.data_dir, "data", data.path
                )
                print(f"Full image path: {img_path}")

                if not os.path.exists(img_path):
                    print(f"Image file not found: {img_path}")
                    continue

                img = cv2.imread(img_path)
                if img is None:
                    print(f"Failed to read image: {img_path}")
                    continue

                input_data.append((data_id, img, img_path))
                print(f"Successfully loaded: {img_path}")

            except Exception as e:
                print(f"Error loading data {data_id}: {str(e)}")
                import traceback
                traceback.print_exc()
                continue

        print(f"Total loaded data: {len(input_data)}")
        return input_data

    def save_processed_result(
        self,
        original_data_id: int,
        processed_img: np.ndarray,
        filename: str,
        relative_path: str,
        metadata: Dict,
        category: Optional[str] = None,
    ) -> Tuple[Data, ProcessedData]:
        """保存处理结果到 Data 和 ProcessedData 表，并保存图片到本地"""
        task = self.get_or_create_task()

        # 确保路径格式正确，移除多余的 'data/' 前缀
        if relative_path.startswith("data/"):
            relative_path = relative_path[5:]

        # 确保目标目录存在
        save_dir = Path(self.data_manager.project.data_dir) / "data" / Path(relative_path).parent
        save_dir.mkdir(parents=True, exist_ok=True)

        # 保存图片到本地
        save_path = save_dir / Path(relative_path).name
        print(f"Saving processed image to: {save_path}")
        cv2.imwrite(str(save_path), processed_img)

        # 1. 保存到 Data 表
        data = Data(
            path=relative_path,
            project_id=self.data_manager.project_id,
            task_id=task.task_id,
            original_data_id=original_data_id,
            workflow_execution_id=self.node_execution.execution_id,
            node_execution_id=self.node_execution.id,
            processing_stage=self.node_execution.node_id,
            category=category,
            metadata_=metadata,
        )
        self.session.add(data)
        self.session.commit()

        # 2. 保存到 ProcessedData 表
        processed_data = self.data_manager.save_processed_data(
            node_execution_id=self.node_execution.id,
            original_data_id=original_data_id,
            data=cv2.imencode(".jpg", processed_img)[1].tobytes(),
            filename=filename,
            file_path=relative_path,
            node_type=self.node_execution.node_type,
            node_id=self.node_execution.node_id,
            metadata_=metadata,
        )
        self.session.add(processed_data)
        self.session.commit()

        print(f"Successfully saved processed data: {relative_path}")
        return data, processed_data
