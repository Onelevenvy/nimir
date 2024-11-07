# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Dict, List, Optional

from sqlalchemy import JSON
from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:
    from .annotation import Annotation
    from .label import Label
    from .task import Task
    from .workflow import Workflow, WorkflowExecution


class ProjectBase(SQLModel):
    name: str = Field(unique=True)
    description: Optional[str] = None
    data_dir: str = Field(unique=True)


class Project(ProjectBase, table=True):
    __tablename__ = "project"
    __table_args__ = {"comment": "Stores information and settings for each project"}

    project_id: Optional[int] = Field(default=None, primary_key=True)
    task_category_id: Optional[int] = Field(default=0)
    created: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    modified: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    labels: List["Label"] = Relationship(back_populates="project")
    tasks: List["Task"] = Relationship(back_populates="project")
    annotations: List["Annotation"] = Relationship(back_populates="project")
    workflows: List["Workflow"] = Relationship(back_populates="project")
    current_workflow: Optional[Dict] = Field(
        default={}, sa_type=JSON, nullable=True
    )  # 当前工作流配置
    workflow_version: Optional[int] = Field(default=1, nullable=True)  # 工作流版本
    workflow_executions: List["WorkflowExecution"] = Relationship(
        back_populates="project"
    )


class ProjectCreate(ProjectBase):
    task_category_id: Optional[int] = Field(default=0)


class ProjectUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    data_dir: Optional[str] = None
    task_category_id: Optional[int] = None


class ProjectOut(ProjectBase):
    project_id: int
    task_category_id: Optional[int] = Field(default=0)
    created: datetime
    modified: datetime

    class Config:
        from_attributes = True
