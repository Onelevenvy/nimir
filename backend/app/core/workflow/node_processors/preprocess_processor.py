# backend/app/core/workflow/node_processors/preprocess_processor.py

from typing import List
from app.models.data import Data
from app.models.workflow import ProcessedData, WorkflowNodeExecution
import cv2
from pathlib import Path
from .base_processor import BaseNodeProcessor
from sqlalchemy import select


class PreprocessNodeProcessor(BaseNodeProcessor):
    async def process(self) -> List[int]:
        output_data_ids = []
        
        try:
            # 清理旧数据
            await self.clean_old_data()
            
            # 加载输入数据
            input_data = await self.load_input_data()
            print(f"\n=== Processing {len(input_data)} images for {self.node_execution.node_id} ===")
            print(f"Node config: {self.node_execution.config}")

            if not input_data:
                return []

            for data_id, img, original_path in input_data:
                try:
                    print(f"\nProcessing image: {original_path}")
                    
                    # 获取输入数据记录 (对于预处理节点，data_id 是 ProcessedData 的 ID)
                    processed_data = self.session.get(ProcessedData, data_id)
                    if not processed_data:
                        print(f"No ProcessedData found for ID: {data_id}")
                        continue

                    # 执行预处理
                    resize = self.node_execution.config.get("params", {}).get("resize", [416, 416])
                    print(f"Resizing to: {resize}")
                    
                    processed_img = cv2.resize(img, tuple(resize))
                    print(f"Resized image shape: {processed_img.shape}")

                    # 生成文件名和元数据
                    filename = f"preprocessed_{Path(original_path).name}"
                    relative_path = f"preprocessed/{filename}"
                    metadata = {
                        "resize": resize,
                        "original_shape": img.shape,
                        "processed_shape": processed_img.shape,
                        "original_data_id": processed_data.original_data_id,
                        "filename": filename
                    }

                    # 保存处理结果
                    data, _ = self.save_processed_result(
                        original_data_id=processed_data.original_data_id,
                        processed_img=processed_img,
                        filename=filename,
                        relative_path=relative_path,
                        metadata=metadata
                    )
                    
                    output_data_ids.append(data.data_id)
                    print(f"Successfully processed: {filename}")

                except Exception as e:
                    print(f"Error processing image {original_path}: {str(e)}")
                    continue

            print(f"\nNode {self.node_execution.node_id} processed {len(output_data_ids)} items")
            return output_data_ids

        except Exception as e:
            print(f"Error in process method: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

    async def train(self, **kwargs):
        """预处理节点不需要训练"""
        pass
