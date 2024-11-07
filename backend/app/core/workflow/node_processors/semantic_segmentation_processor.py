# backend/app/core/workflow/node_processors/semantic_segmentation_processor.py

from typing import List
import cv2
import numpy as np
from pathlib import Path
from .base_processor import BaseNodeProcessor
from app.models.data import Data
from app.models.workflow import ProcessedData
from sqlmodel import select


class SemanticSegmentationNodeProcessor(BaseNodeProcessor):
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

                    # TODO: 实际的语义分割逻辑
                    segmented_img = img.copy()
                    mask = np.zeros(img.shape[:2], dtype=np.uint8)
                    cv2.rectangle(mask, (100, 100), (300, 300), 1, -1)
                    cv2.rectangle(mask, (350, 350), (500, 500), 2, -1)
                    segmented_img = cv2.addWeighted(segmented_img, 0.7, 
                                                  cv2.cvtColor(mask * 80, cv2.COLOR_GRAY2BGR), 0.3, 0)

                    # 生成文件名和元数据
                    filename = f"semantic_{Path(original_path).name}"
                    relative_path = f"results/semantic_segmentation/{filename}"
                    metadata = {
                        "classes": ["background", "class1", "class2"],
                        "mask": mask.tolist(),
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
        """训练语义分割模型"""
        pass
