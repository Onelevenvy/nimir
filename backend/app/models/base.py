# -*- coding: utf-8 -*-
from __future__ import annotations

from datetime import datetime, timezone
from typing import TypeVar

from sqlmodel import Field, SQLModel

T = TypeVar("T")


# TODO: nn string col cant be ""
class BaseModel(SQLModel):
    created: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    modified: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )

    _immutables = ["created", "modified", "immutables"]
    _nested = ["project"]

    @classmethod
    def _exists(cls, item_id):
        # 实现检查项目是否存在的逻辑
        pass

    @classmethod
    def _get(cls, many=False, **kwargs):
        # 实现获取项目的逻辑
        pass
