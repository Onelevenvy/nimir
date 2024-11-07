import asyncio
import time
from typing import Annotated, Any, Dict, List, Union

from langgraph.graph import END, StateGraph
from pydantic import BaseModel, Field

from app.core.workflow.base_node import BaseNodeConfig, NodeType
from app.core.workflow.test.nodes import (
    ImageSourceConfig,
    ImageSourceNode,
    ObjectDetectionConfig,
    ObjectDetectionNode,
    PostProcessConfig,
    PostProcessNode,
    PreprocessConfig,
    PreprocessNode,
    SemanticSegmentationConfig,
    SemanticSegmentationNode,
)


class Edge(BaseModel):
    source: str
    target: str


class WorkflowConfigModel(BaseModel):
    nodes: List[
        Union[
            ImageSourceConfig,
            PreprocessConfig,
            ObjectDetectionConfig,
            SemanticSegmentationConfig,
            PostProcessConfig,
        ]
    ]
    edges: List[Edge]


class WorkflowConfig(BaseModel):
    config: WorkflowConfigModel


def validate_workflow_config(config: Dict[str, Any]) -> WorkflowConfig:
    try:
        validated_config = WorkflowConfig(config=WorkflowConfigModel(**config))
        return validated_config
    except ValueError as e:
        print(f"Configuration validation failed: {e}")
        raise


def create_node(node_config: BaseNodeConfig, workflow_config: WorkflowConfig) -> Any:
    node_types = {
        NodeType.IMAGE_SOURCE: ImageSourceNode,
        NodeType.PREPROCESS: PreprocessNode,
        NodeType.OBJECT_DETECTION: ObjectDetectionNode,
        NodeType.SEMANTIC_SEGMENTATION: SemanticSegmentationNode,
        NodeType.POST_PROCESS: PostProcessNode,
    }
    node_class = node_types.get(node_config.type)
    if node_class:
        return node_class(node_config.name, node_config.params, workflow_config)
    raise ValueError(f"Unknown node type: {node_config.type}")


def save_graph_image(graph, filename=None):
    if filename is None:
        filename = f"save_graph_{time.time()}.png"
    try:
        img_data = graph.get_graph().draw_mermaid_png()
        with open(filename, "wb") as f:
            f.write(img_data)
        print(f"Graph image saved as {filename}")
    except Exception as e:
        print(f"Unable to draw graph: {e}")


def add_node_data(base: Dict[str, Any], new_data: Dict[str, Any]) -> Dict[str, Any]:
    """Adds new node data to the existing state, updating nested dictionaries if necessary."""
    result = base.copy()
    for key, value in new_data.items():
        if isinstance(value, dict) and key in result and isinstance(result[key], dict):
            result[key] = add_node_data(result[key], value)
        else:
            result[key] = value
    return result


# 状态类
class TqxState(BaseModel):
    data: Annotated[Dict[str, Any], add_node_data] = Field(default_factory=dict)


def create_workflow(
    config: Dict[str, Any], use_async: bool = False, save_graph: bool = False
) -> StateGraph:
    validated_config = validate_workflow_config(config)
    workflow = StateGraph(TqxState)

    for node_config in validated_config.config.nodes:
        node = create_node(node_config, validated_config)
        if use_async:
            workflow.add_node(node_config.name, node.work_async)
        else:
            workflow.add_node(node_config.name, node.work)

    workflow.set_entry_point(validated_config.config.nodes[0].name)

    for edge in validated_config.config.edges:
        workflow.add_edge(edge.source, edge.target)

    graphs = workflow.compile()
    if save_graph:
        save_graph_image(graphs)
    return graphs


async def main(use_async: bool = False, save_graph: bool = False):
    # 示例配置（现在是 JSON 格式）
    example_config = {
        "nodes": [
            {
                "name": "image_source",
                "type": "image_source",
                "params": {
                    "source_type": "file",
                    "path": "backend/app/core/workflow/images",
                },
            },
            {
                "name": "preprocess",
                "type": "preprocess",
                "params": {"resize": (416, 416)},  # roi is optional and can be omitted
            },
            {
                "name": "detect_1",
                "type": "object_detection",
                "params": {"model": "yolov8n.pt"},  # confidence_threshold is optional
            },
            {
                "name": "detect_2",
                "type": "object_detection",
                "params": {"model": "yolov8n.pt", "confidence_threshold": 0.6},
            },
            {
                "name": "segment",
                "type": "semantic_segmentation",
                "params": {
                    "model": "yolov8n-seg.pt",
                    "classes": ["background", "object"],
                },
            },
            {
                "name": "postprocess",
                "type": "post_process",
                "params": {"output_format": "json"},
            },
        ],
        "edges": [
            {"source": "image_source", "target": "preprocess"},
            {"source": "preprocess", "target": "detect_1"},
            {"source": "preprocess", "target": "detect_2"},
            {"source": "detect_1", "target": "segment"},
            {"source": "detect_2", "target": "segment"},
            {"source": "segment", "target": "postprocess"},
            {"source": "postprocess", "target": END},
        ],
    }

    # 创建工作流
    graph = create_workflow(example_config, use_async, save_graph=save_graph)

    # 初始化状态
    initial_state = TqxState()

    # 运行工作流
    if use_async:
        final_state = await graph.ainvoke(initial_state)
    else:
        final_state = graph.invoke(initial_state)

    # 打印最终结束
    print("workflow 结束", final_state)


# # 如果需要从数据库读取配置，可以添加以下函数
# async def load_workflow_config_from_db(workflow_id: int) -> WorkflowConfig:
#     # 这里应该是从数据库加载 Workflow 配置的代码
#     # 例如：
#     # workflow = await Workflow.get(workflow_id)
#     # return WorkflowConfig(config=json.loads(workflow.config))
#     pass


if __name__ == "__main__":
    use_async = False  # 设置为 True 使用异步模式，False 使用同步模式
    asyncio.run(main(use_async, save_graph=False))
