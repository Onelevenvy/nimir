from typing import Annotated, Any, Dict
from pydantic import BaseModel, Field


def merge_workflow_data(base: Dict[str, Any], right: Dict[str, Any]) -> Dict[str, Any]:
    """合并工作流数据"""
    result = base.copy()
    for key, value in right.items():
        if isinstance(value, dict) and key in result and isinstance(result[key], dict):
            result[key] = merge_workflow_data(result[key], value)
        else:
            result[key] = value
    return result


class WorkflowState(BaseModel):
    """工作流状态类"""

    data: Annotated[Dict[str, Any], merge_workflow_data] = Field(default_factory=dict)

    def model_dump(self) -> Dict[str, Any]:
        return {"data": self.data}
