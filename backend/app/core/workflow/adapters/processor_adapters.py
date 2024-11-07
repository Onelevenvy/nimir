from typing import Any
from sqlmodel import Session
from app.models.workflow import WorkflowExecution
from app.core.workflow.node_processors import (
    ImageSourceNodeProcessor,
    PreprocessNodeProcessor,
    ObjectDetectionNodeProcessor,
    SemanticSegmentationNodeProcessor,
    InstanceSegmentationNodeProcessor
)
from .base_adapter import ProcessorNodeAdapter

class ImageSourceNodeAdapter(ProcessorNodeAdapter):
    def __init__(self, node_id: str, params: dict, workflow_config: Any, session: Session, execution: WorkflowExecution):
        super().__init__(
            node_id=node_id,
            params=params,
            workflow_config=workflow_config,
            processor_class=ImageSourceNodeProcessor,
            session=session,
            execution=execution
        )

class PreprocessNodeAdapter(ProcessorNodeAdapter):
    def __init__(self, node_id: str, params: dict, workflow_config: Any, session: Session, execution: WorkflowExecution):
        super().__init__(
            node_id=node_id,
            params=params,
            workflow_config=workflow_config,
            processor_class=PreprocessNodeProcessor,
            session=session,
            execution=execution
        )

class ObjectDetectionNodeAdapter(ProcessorNodeAdapter):
    def __init__(self, node_id: str, params: dict, workflow_config: Any, session: Session, execution: WorkflowExecution):
        super().__init__(
            node_id=node_id,
            params=params,
            workflow_config=workflow_config,
            processor_class=ObjectDetectionNodeProcessor,
            session=session,
            execution=execution
        )

class SemanticSegmentationNodeAdapter(ProcessorNodeAdapter):
    def __init__(self, node_id: str, params: dict, workflow_config: Any, session: Session, execution: WorkflowExecution):
        super().__init__(
            node_id=node_id,
            params=params,
            workflow_config=workflow_config,
            processor_class=SemanticSegmentationNodeProcessor,
            session=session,
            execution=execution
        )

class InstanceSegmentationNodeAdapter(ProcessorNodeAdapter):
    def __init__(self, node_id: str, params: dict, workflow_config: Any, session: Session, execution: WorkflowExecution):
        super().__init__(
            node_id=node_id,
            params=params,
            workflow_config=workflow_config,
            processor_class=InstanceSegmentationNodeProcessor,
            session=session,
            execution=execution
        )