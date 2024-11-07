from typing import Any, Dict, Optional, Tuple

import cv2
from pydantic import BaseModel, Field, field_validator

from ..base_node import BaseNode, BaseNodeConfig, NodeType


class PreprocessConfig(BaseNodeConfig):
    type: NodeType = Field(NodeType.PREPROCESS, frozen=True)
    params: Dict[str, Any] = Field(default_factory=dict)

    class Params(BaseModel):
        resize: Optional[Tuple[int, int]] = Field(
            default=(360, 360), description="Resize dimensions"
        )
        roi: Optional[Tuple[int, int, int, int]] = Field(
            default=None, description="Region of Interest (x, y, w, h)"
        )

    @field_validator("params")
    def validate_params(cls, v):
        return cls.Params(**v).model_dump()


class PreprocessNode(BaseNode):
    def work(self, state: Any) -> Any:
        self.print_log("开始执行")
        resize = self.params.get("resize", (360, 360))
        roi = self.params.get("roi", None)

        input_node = self.get_input_node()
        if input_node is None:
            self.print_log("No input node found")
            return state

        input_images = state.data.get(f"images_{input_node}", [])

        processed_images = []
        for img in input_images:
            if roi:
                x, y, w, h = roi
                img = img[y : y + h, x : x + w]
            img = cv2.resize(img, resize)
            processed_images.append(img)

        self.print_log("执行完成")
        state.data[f"processed_images_{self.node_id}"] = processed_images
        return state
