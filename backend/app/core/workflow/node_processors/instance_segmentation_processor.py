# backend/app/core/workflow/node_processors/instance_segmentation_processor.py

from typing import List
import cv2
import numpy as np
from pathlib import Path
from .base_processor import BaseNodeProcessor
from app.models.data import Data
from app.models.workflow import ProcessedData
from sqlmodel import select


class InstanceSegmentationNodeProcessor(BaseNodeProcessor):
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
                    
                    # 获取输入数据记录
                    input_data = self.session.get(Data, data_id)
                    if not input_data:
                        print(f"No Data record found for ID: {data_id}")
                        continue

                    # TODO: 实际的实例分割逻辑
                    segmented_img = img.copy()
                    mask = np.zeros(img.shape[:2], dtype=np.uint8)
                    cv2.circle(mask, (img.shape[1]//2, img.shape[0]//2), 100, 255, -1)
                    segmented_img[mask > 0] = segmented_img[mask > 0] * 0.7 + np.array([0, 0, 255]) * 0.3

                    # 生成文件名和元数据
                    filename = f"segmented_{Path(original_path).name}"
                    relative_path = f"results/instance_segmentation/{filename}"
                    metadata = {
                        "instances": [
                            {
                                "mask": mask.tolist(),
                                "class": "example",
                                "confidence": 0.95
                            }
                        ],
                        "original_data_id": input_data.original_data_id,
                        "filename": filename
                    }

                    # 保存处理结果
                    data, _ = self.save_processed_result(
                        original_data_id=input_data.original_data_id,
                        processed_img=segmented_img,
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
        """训练实例分割模型"""
        pass