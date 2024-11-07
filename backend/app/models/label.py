# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .annotation import Annotation
    from .project import Project


class LabelBase(SQLModel):
    project_id: int = Field(foreign_key="project.project_id")
    name: str
    color: Optional[str] = None
    comment: Optional[str] = None
    super_category_id: Optional[int] = None


class Label(LabelBase, table=True):
    __tablename__ = "label"
    __table_args__ = {"comment": "Contains all the label information"}

    label_id: Optional[int] = Field(default=None, primary_key=True)
    created: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    modified: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    project: "Project" = Relationship(back_populates="labels")
    annotations: List["Annotation"] = Relationship(
        back_populates="label", sa_relationship_kwargs={"lazy": "noload"}
    )


class LabelCreate(LabelBase):
    pass


class LabelUpdate(SQLModel):
    name: Optional[str] = None
    color: Optional[str] = None
    comment: Optional[str] = None
    super_category_id: Optional[int] = None


class LabelOut(LabelBase):
    label_id: int
    created: datetime
    modified: datetime

    class Config:
        from_attributes = True
