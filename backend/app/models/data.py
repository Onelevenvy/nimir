# backend/app/models/data.py

from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional, Dict
from app.models.workflow import WorkflowExecution, WorkflowNodeExecution
from sqlalchemy import JSON
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .annotation import Annotation
    from .task import Task
    from .workflow import ProcessedData


class DataBase(SQLModel):
    path: str
    task_id: int = Field(foreign_key="task.task_id")
    project_id: int = Field(foreign_key="project.project_id")
    predicted: bool = Field(default=False)


class Data(DataBase, table=True):
    __tablename__ = "data"
    __table_args__ = {"comment": "Stores all data files"}

    data_id: Optional[int] = Field(default=None, primary_key=True)
    original_data_id: Optional[int] = Field(default=None, foreign_key="data.data_id")
    workflow_execution_id: Optional[int] = Field(
        default=None, 
        foreign_key="workflow_execution.execution_id"
    )
    node_execution_id: Optional[int] = Field(
        default=None, 
        foreign_key="workflow_node_execution.id"
    )
    processing_stage: str = Field(default="original")
    category: Optional[str] = None
    metadata_: Dict = Field(default={}, sa_type=JSON)

    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    task: "Task" = Relationship(back_populates="datas")
    annotations: List["Annotation"] = Relationship(
        back_populates="data", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    processed_data: List["ProcessedData"] = Relationship(
        back_populates="original_data",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )
    workflow_execution: Optional["WorkflowExecution"] = Relationship(
        back_populates="data"
    )
    node_execution: Optional["WorkflowNodeExecution"] = Relationship(
        back_populates="data"
    )
    original: Optional["Data"] = Relationship(
        back_populates="versions",
        sa_relationship_kwargs={
            "primaryjoin": "Data.original_data_id==Data.data_id",
            "remote_side": "Data.data_id",
        },
    )
    versions: List["Data"] = Relationship(
        back_populates="original",
        sa_relationship_kwargs={
            "primaryjoin": "Data.original_data_id==Data.data_id",
        },
    )


class DataCreate(DataBase):
    pass


class DataUpdate(SQLModel):
    path: Optional[str] = None
    task_id: Optional[int] = None
    project_id: Optional[int] = None
    predicted: Optional[bool] = None


class DataOut(DataBase):
    data_id: int
    created: datetime
    modified: datetime

    class Config:
        from_attributes = True
