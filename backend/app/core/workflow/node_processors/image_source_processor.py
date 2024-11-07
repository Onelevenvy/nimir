# backend/app/core/workflow/node_processors/image_source_processor.py

from datetime import datetime, timezone
from typing import List
from app.models.data import Data
from app.models.workflow import ProcessedData
import cv2
from pathlib import Path
from sqlmodel import select
from .base_processor import BaseNodeProcessor


class ImageSourceNodeProcessor(BaseNodeProcessor):
    async def process(self) -> List[int]:
        output_data_ids = []
        source_path = self.node_execution.config.get("path")
        print(f"Processing images from: {source_path}")

        # 获取项目的完整数据目录路径
        project_data_dir = Path(self.data_manager.project.data_dir)
        task = self.get_or_create_task()
        
        # 首先清理旧数据
        await self.clean_old_data()
        
        # 1. 查询或创建数据记录
        source_dir = project_data_dir / "data" / "original"
        if source_dir.exists() and source_dir.is_dir():
            for ext in [".jpg", ".jpeg", ".png", ".bmp", ".gif"]:
                for img_path in source_dir.glob(f"*{ext}"):
                    try:
                        # 检查是否已存在数据记录
                        relative_path = f"original/{img_path.name}"
                        data = self.session.exec(
                            select(Data).where(
                                Data.path == relative_path,
                                Data.project_id == self.data_manager.project_id,
                                Data.processing_stage == "original"
                            )
                        ).first()

                        if not data:
                            # 如果不存在，创建新的数据记录
                            data = Data(
                                path=relative_path,
                                project_id=self.data_manager.project_id,
                                task_id=task.task_id,
                                processing_stage="original",
                                workflow_execution_id=self.node_execution.execution_id,
                                node_execution_id=self.node_execution.id,
                                metadata_={
                                    "original_filename": img_path.name,
                                    "source_path": str(source_dir)
                                }
                            )
                        else:
                            # 如果存在，更新现有记录
                            data.workflow_execution_id = self.node_execution.execution_id
                            data.node_execution_id = self.node_execution.id
                            data.metadata_["last_processed"] = datetime.now(timezone.utc).isoformat()
                        
                        self.session.add(data)
                        self.session.commit()

                        # 2. 创建 ProcessedData 记录
                        processed_data = ProcessedData(
                            original_data_id=data.data_id,
                            node_execution_id=self.node_execution.id,
                            file_path=relative_path,
                            file_type="image",
                            format=img_path.suffix.lstrip("."),
                            metadata_={
                                "original_path": str(img_path),
                                "data_id": data.data_id
                            },
                            created_at=datetime.now(timezone.utc),
                        )

                        self.session.add(processed_data)
                        self.session.commit()
                        output_data_ids.append(processed_data.id)

                    except Exception as e:
                        print(f"Error processing {img_path.name}: {str(e)}")
                        continue

        print(f"Processed {len(output_data_ids)} images")
        return output_data_ids

    async def train(self, **kwargs):
        """图像源节点不需要训练"""
        pass
