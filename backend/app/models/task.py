# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .annotation import Annotation
    from .data import Data
    from .project import Project


class TaskBase(SQLModel):
    project_id: int = Field(foreign_key="project.project_id")
    set: int = Field(default=0)  # 0 train, 1 val, 2 test


class Task(TaskBase, table=True):
    __tablename__ = "task"
    __table_args__ = {"comment": "Contains all the tasks"}

    task_id: Optional[int] = Field(default=None, primary_key=True)
    # 修改这里，使用 lambda 函数作为 default_factory
    created: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    modified: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    project: "Project" = Relationship(back_populates="tasks")
    datas: List["Data"] = Relationship(
        back_populates="task", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    set: Optional[int] = None


class TaskOut(TaskBase):
    task_id: int
    created: datetime
    modified: datetime
    data_paths: Optional[List[str]] = None

    class Config:
        from_attributes = True
