from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class NodeType(str, Enum):
    IMAGE_SOURCE = "image_source"
    PREPROCESS = "preprocess"
    OBJECT_DETECTION = "object_detection"
    SEMANTIC_SEGMENTATION = "semantic_segmentation"
    POST_PROCESS = "post_process"


class BaseNodeConfig(BaseModel):
    name: str
    type: NodeType
    params: Dict[str, Any] = Field(default_factory=dict)


class BaseNode:
    def __init__(self, node_id: str, params: Dict[str, Any], workflow_config: Any):
        self.node_id = node_id
        self.params = params
        self.workflow_config = workflow_config

    def print_log(self, message: str):
        print(f"[{self.node_id}] {message}")

    def work(self, state: Any) -> Any:
        raise NotImplementedError("This method should be implemented by subclasses")

    async def work_async(self, state: Any) -> Any:
        raise NotImplementedError("This method should be implemented by subclasses")

    def get_input_node(self) -> Optional[str]:
        for edge in self.workflow_config.config.edges:
            if edge.target == self.node_id:
                return edge.source
        return None
