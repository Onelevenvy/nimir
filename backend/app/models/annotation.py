# -*- coding: utf-8 -*-
import json
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional

from pydantic import field_validator
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .data import Data
    from .label import Label
    from .project import Project


class AnnotationBase(SQLModel):
    frontend_id: Optional[int] = None
    type: str  # "polygon" 或 "rectangle"
    points: str = Field(default="")
    color: str = Field(default="#FF0000")
    label_id: int = Field(foreign_key="label.label_id")
    data_id: int = Field(foreign_key="data.data_id")
    project_id: int = Field(foreign_key="project.project_id")
    labelme_data: Optional[str] = None
    processing_stage: str = Field(default="original")
    workflow_execution_id: Optional[int] = Field(
        default=None, foreign_key="workflow_execution.execution_id"
    )
    node_execution_id: Optional[int] = Field(
        default=None, foreign_key="workflow_node_execution.id"
    )

    @field_validator("labelme_data")
    def validate_labelme_data(cls, v):
        if v is not None:
            try:
                # 验证是否是有效的 JSON 字符串
                json.loads(v)
            except json.JSONDecodeError:
                raise ValueError("labelme_data must be a valid JSON string")
        return v


class AnnotationCreate(AnnotationBase):
    annotation_id: Optional[int] = None


class Annotation(AnnotationBase, table=True):
    __tablename__ = "annotation"
    __table_args__ = {"comment": "Stores all annotations"}

    annotation_id: Optional[int] = Field(default=None, primary_key=True)
    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    modified: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    label: "Label" = Relationship(back_populates="annotations")
    data: "Data" = Relationship(back_populates="annotations")
    project: "Project" = Relationship(back_populates="annotations")


class AnnotationUpdate(SQLModel):
    frontend_id: Optional[int] = None
    type: Optional[str] = None
    points: Optional[str] = None
    color: Optional[str] = None
    label_id: Optional[int] = None
    data_id: Optional[int] = None
    project_id: Optional[int] = None
    labelme_data: Optional[str] = None


class AnnotationOut(AnnotationBase):
    annotation_id: int
    created: datetime
    modified: datetime
    points: str = Field(default="")
    color: str = Field(default="#FF0000")

    class Config:
        from_attributes = True
