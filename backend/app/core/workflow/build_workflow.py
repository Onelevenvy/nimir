from typing import Any, Dict, List
from langgraph.graph import END, StateGraph
from pydantic import BaseModel
from sqlmodel import Session
from app.core.workflow.adapters.processor_adapters import (
    ImageSourceNodeAdapter,
    PreprocessNodeAdapter,
    ObjectDetectionNodeAdapter,
    SemanticSegmentationNodeAdapter,
    InstanceSegmentationNodeAdapter,
)
from app.models.workflow import WorkflowExecution
from app.core.workflow.tqx_state import WorkflowState


class Edge(BaseModel):
    source: str
    target: str


class WorkflowConfigModel(BaseModel):
    nodes: List[Dict[str, Any]]
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


def create_node(
    node_config: Dict[str, Any],
    workflow_config: WorkflowConfig,
    session: Session,
    execution: WorkflowExecution,
) -> Any:
    node_types = {
        "image_source": ImageSourceNodeAdapter,
        "preprocess": PreprocessNodeAdapter,
        "object_detection": ObjectDetectionNodeAdapter,
        "semantic_segmentation": SemanticSegmentationNodeAdapter,
        "instance_segmentation": InstanceSegmentationNodeAdapter,
    }

    node_class = node_types.get(node_config["type"])
    if node_class:
        return node_class(
            node_id=node_config["name"],
            params=node_config["params"],
            workflow_config=workflow_config,
            session=session,
            execution=execution,
        )
    raise ValueError(f"Unknown node type: {node_config['type']}")


def create_langgraph_workflow(
    config: Dict[str, Any],
    session: Session,
    execution: WorkflowExecution,
    use_async: bool = True,
    save_graph: bool = False,
) -> StateGraph:
    validated_config = validate_workflow_config(config)
    workflow = StateGraph(WorkflowState)

    # 添加节点
    for node_config in validated_config.config.nodes:
        node = create_node(node_config, validated_config, session, execution)
        if use_async:
            workflow.add_node(node_config["name"], node.work_async)
        else:
            workflow.add_node(node_config["name"], node.work)

    # 设置入口节点
    workflow.set_entry_point(validated_config.config.nodes[0]["name"])

    # 添加边
    for edge in validated_config.config.edges:
        workflow.add_edge(edge.source, edge.target)

    # 编译图
    graph = workflow.compile()

    return graph
