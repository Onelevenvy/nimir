# backend/app/models/workflow.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional, Dict
from sqlmodel import Field, Relationship, SQLModel, JSON
from enum import Enum

if TYPE_CHECKING:
    from .project import Project
    from .data import Data


class NodeStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class WorkflowBase(SQLModel):
    name: str
    description: Optional[str] = None
    config: Dict = Field(default={}, sa_type=JSON)


class Workflow(WorkflowBase, table=True):
    """工作流定义"""

    __tablename__ = "workflow"

    workflow_id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.project_id")
    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    project: "Project" = Relationship(back_populates="workflows")
    executions: List["WorkflowExecution"] = Relationship(back_populates="workflow")


class ProcessedData(SQLModel, table=True):
    """处理后的数据"""

    __tablename__ = "processed_data"

    id: Optional[int] = Field(default=None, primary_key=True)
    original_data_id: Optional[int] = Field(
        default=None, foreign_key="data.data_id", nullable=True
    )
    node_execution_id: int = Field(foreign_key="workflow_node_execution.id")
    file_path: str
    file_type: str = Field(default="image")
    format: str = Field(default="jpg")
    metadata_: Dict = Field(default={}, sa_type=JSON)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    node_execution: "WorkflowNodeExecution" = Relationship(
        back_populates="processed_data"
    )
    original_data: Optional["Data"] = Relationship(
        back_populates="processed_data"
    )


class WorkflowNodeExecution(SQLModel, table=True):
    """工作流节点执行记录"""

    __tablename__ = "workflow_node_execution"

    id: Optional[int] = Field(default=None, primary_key=True)
    execution_id: int = Field(foreign_key="workflow_execution.execution_id")
    node_id: str
    node_type: str
    status: NodeStatus = Field(default=NodeStatus.PENDING)
    config: Dict = Field(default={}, sa_type=JSON)
    input_data_ids: List[int] = Field(default=[], sa_type=JSON)
    output_data_ids: List[int] = Field(default=[], sa_type=JSON)
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    execution: "WorkflowExecution" = Relationship(back_populates="node_executions")
    processed_data: List["ProcessedData"] = Relationship(
        back_populates="node_execution",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    data: List["Data"] = Relationship(
        back_populates="node_execution",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class WorkflowExecution(SQLModel, table=True):
    """工作流执行记录"""

    __tablename__ = "workflow_execution"

    execution_id: Optional[int] = Field(default=None, primary_key=True)
    workflow_id: Optional[int] = Field(foreign_key="workflow.workflow_id", nullable=True)
    project_id: Optional[int] = Field(foreign_key="project.project_id", nullable=True)
    workflow_version: int = Field(default=1, nullable=True)
    status: str = Field(default="pending")
    config: Dict = Field(default={}, sa_type=JSON, nullable=True)
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    workflow: Optional[Workflow] = Relationship(back_populates="executions")
    project: Optional["Project"] = Relationship(back_populates="workflow_executions")
    node_executions: List[WorkflowNodeExecution] = Relationship(
        back_populates="execution",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    data: List["Data"] = Relationship(
        sa_relationship_kwargs={
            "primaryjoin": "WorkflowExecution.execution_id==Data.workflow_execution_id",
            "cascade": "all, delete-orphan"
        }
    )


class WorkflowNodeConfig(SQLModel):
    input_selector: Dict = Field(default={})  # 新增：输入数据选择器
    """
    示例配置:
    {
        "stage": "preprocessed",
        "category": "A",
        "conditions": {
            "confidence": {"min": 0.8}
        }
    }
    """


# API Models
class WorkflowCreate(WorkflowBase):
    project_id: int


class WorkflowUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[Dict] = None


class WorkflowOut(WorkflowBase):
    workflow_id: int
    project_id: int
    created: datetime
    modified: datetime

    class Config:
        from_attributes = True
