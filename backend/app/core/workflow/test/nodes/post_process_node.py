from typing import Any, Dict

from pydantic import BaseModel, Field, field_validator

from ..base_node import BaseNode, BaseNodeConfig, NodeType


class PostProcessConfig(BaseNodeConfig):
    type: NodeType = Field(NodeType.POST_PROCESS, frozen=True)
    params: Dict[str, Any] = Field(...)

    class Params(BaseModel):
        output_format: str = Field(
            ..., description="Output format (e.g., 'json', 'xml', 'yaml')"
        )

    @field_validator("params")
    def validate_params(cls, v):
        return cls.Params(**v).model_dump()


class PostProcessNode(BaseNode):
    def work(self, state: Any) -> Any:
        self.print_log("开始执行")
        output_format = self.params.get("output_format", "json")
        self.print_log(f"后处理功能尚未实现，输出格式: {output_format}")
        # TODO: 实现后处理功能
        self.print_log("执行完成")
        return state
