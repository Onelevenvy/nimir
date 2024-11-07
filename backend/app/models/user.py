from typing import List, Optional

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, SQLModel


# 基础消息模型
class Message(SQLModel):
    message: str


# Token 相关模型
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(SQLModel):
    sub: Optional[int] = None


class NewPassword(SQLModel):
    token: str
    new_password: str


# 用户相关模型
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    language: str = Field(default="en-US")


class UserCreate(UserBase):
    password: str


class UserCreateOpen(SQLModel):
    email: str
    password: str
    full_name: Optional[str] = None


class UserUpdate(UserBase):
    email: Optional[str] = None
    password: Optional[str] = None


class UserUpdateMe(SQLModel):
    full_name: Optional[str] = None
    email: Optional[str] = None


class UpdatePassword(SQLModel):
    current_password: str
    new_password: str


class UpdateLanguageMe(SQLModel):
    language: str = Field(default="en-US")


# 数据库模型
class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str


class UserOut(UserBase):
    id: int


class UsersOut(SQLModel):
    data: List[UserOut]
    count: int


def add_timestamp_columns(cls):
    cls.__table__.append_column(
        Column(
            "created_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
        )
    )
    cls.__table__.append_column(
        Column(
            "updated_at",
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            onupdate=func.now(),
        )
    )
    return cls
