from typing import Any, Dict, List

from pydantic import BaseModel, Field, field_validator

from ..base_node import BaseNode, BaseNodeConfig, NodeType


class SemanticSegmentationConfig(BaseNodeConfig):
    type: NodeType = Field(NodeType.SEMANTIC_SEGMENTATION, frozen=True)
    params: Dict[str, Any] = Field(...)

    class Params(BaseModel):
        model: str = Field(..., description="Model path is required")
        classes: List[str] = Field(..., description="List of class names")

    @field_validator("params")
    def validate_params(cls, v):
        return cls.Params(**v).model_dump()


class SemanticSegmentationNode(BaseNode):
    def work(self, state: Any) -> Any:
        self.print_log("开始执行")
        self.print_log("语义分割功能尚未实现")
        # TODO: 实现语义分割功能
        self.print_log("执行完成")
        return state
