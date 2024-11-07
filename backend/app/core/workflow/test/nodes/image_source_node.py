import os
from typing import Any, Dict

import cv2
import numpy as np
from pydantic import BaseModel, Field, field_validator

from ...base_node import BaseNode, BaseNodeConfig, NodeType


class ImageSourceConfig(BaseNodeConfig):
    type: NodeType = Field(NodeType.IMAGE_SOURCE, frozen=True)
    params: Dict[str, Any] = Field(...)

    class Params(BaseModel):
        source_type: str = Field(..., description="Source type is required")
        path: str = Field(..., description="Path is required")

    @field_validator("params")
    def validate_params(cls, v):
        return cls.Params(**v).model_dump()


class ImageSourceNode(BaseNode):
    def work(self, state: Any) -> Any:
        self.print_log("开始执行")
        source_type = self.params.get("source_type", "file")
        path = self.params.get("path", "")

        images = []

        if source_type == "file":
            if os.path.isfile(path):
                img = cv2.imread(path)
                if img is not None:
                    images.append(img)
                    self.print_log(f"Added image from file: {path}")
                else:
                    self.print_log(f"Failed to read image from file: {path}")
            elif os.path.isdir(path):
                self.print_log(f"Searching for images in directory: {path}")
                for root, _, files in os.walk(path):
                    for file in files:
                        if file.lower().endswith((".png", ".jpg", ".jpeg")):
                            img_path = os.path.join(root, file)
                            img = cv2.imread(img_path)
                            if img is not None:
                                images.append(img)
                                self.print_log(f"Added image: {img_path}")
                            else:
                                self.print_log(f"Failed to read image: {img_path}")
            else:
                self.print_log(f"Path is neither a file nor a directory: {path}")
        elif source_type == "ndarray":
            if isinstance(path, np.ndarray):
                images = [path]
            elif isinstance(path, list) and all(
                isinstance(img, np.ndarray) for img in path
            ):
                images = path
        self.print_log(f"共有{len(images)}张图片")
        self.print_log("执行完成")
        state.data[f"images_{self.node_id}"] = images
        return state
