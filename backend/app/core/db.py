import logging
import os
from pathlib import Path

from sqlmodel import Session, create_engine, select

from app.core.config import settings
from app.curd import users
from app.models.user import User, UserCreate

logger = logging.getLogger(__name__)


def get_url():
    database_type = os.getenv("DATABASE_TYPE", "postgres")
    if database_type == "sqlite":
        sqlite_db = os.getenv("SQLITE_DB", "sqlite.db")
        # 确保数据库文件目录存在
        db_path = Path("./data") / sqlite_db
        db_path.parent.mkdir(parents=True, exist_ok=True)
        url = f"sqlite:///{db_path}"
        logger.info(f"Using SQLite database at: {db_path}")
        print(f"Using SQLite database at: {db_path}")
        return url

    else:  # postgres
        user = os.getenv("POSTGRES_USER", "postgres")
        password = os.getenv("POSTGRES_PASSWORD", "nimir123456")
        server = os.getenv("POSTGRES_SERVER", "localhost")
        port = os.getenv("POSTGRES_PORT", "5432")
        db = os.getenv("POSTGRES_DB", "nimir")
        url = f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"
        logger.info(f"Using PostgreSQL database at: {server}:{port}/{db}")
        print(f"Using PostgreSQL database at: {server}:{port}/{db}")
        return url


# 创建引擎时添加适当的连接参数
def create_db_engine():
    database_type = os.getenv("DATABASE_TYPE", "postgres")
    logger.info(f"Initializing database connection for type: {database_type}")

    url = get_url()

    if database_type == "sqlite":
        # SQLite 特定配置
        engine = create_engine(
            url,
            connect_args={"check_same_thread": False},  # 允许多线程访问
            pool_pre_ping=True,
        )
        logger.info("SQLite engine created with multi-thread support")
    else:
        # PostgreSQL 配置
        engine = create_engine(url, pool_pre_ping=True)
        logger.info("PostgreSQL engine created")

    return engine


engine = create_db_engine()


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/tiangolo/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    database_type = os.getenv("DATABASE_TYPE", "postgres")
    logger.info(f"Initializing database with type: {database_type}")

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = users.create_user(session=session, user_create=user_in)
        logger.info(f"Created superuser: {settings.FIRST_SUPERUSER}")

    session.commit()
