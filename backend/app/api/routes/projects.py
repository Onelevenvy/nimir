import os
import os.path as osp
import platform
import re
from datetime import datetime, timezone
from pathlib import Path
import traceback
from typing import Any, Dict, List, Optional

from app.models.workflow import ProcessedData, Workflow
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlmodel import Session, select
import logging
from app.api.deps import CurrentSuperUser, SessionDep
from app.core.config import settings
from app.models.data import Data
from app.models.project import Project, ProjectCreate, ProjectOut, ProjectUpdate
from app.models.task import Task
from app.utils.label_utils import parse_order_by

router = APIRouter()
logger = logging.getLogger(__name__)


def validate_directory_path(path: str) -> tuple[bool, str]:
    """
    验证目录路径是否合法
    返回: (是否合法, 错误信息)
    """
    try:
        if platform.system() == "Windows":
            return _validate_windows_path(path)
        else:
            return _validate_unix_path(path)
    except Exception as e:
        return False, f"路径验证出错: {str(e)}"


def _validate_windows_path(path: str) -> tuple[bool, str]:
    """Windows 系统的路径验证"""
    # 检查基本格式
    if not re.match(r"^[A-Za-z]:\\", path):
        return False, "Windows 路径必须以驱动器号开头（例如：C:\\）"

    # 规范化路径
    path = path.replace("/", "\\")
    try:
        normalized_path = os.path.normpath(path)
    except Exception:
        return False, "路径格式不正确"

    # 检查路径长度（Windows MAX_PATH 限制）
    if len(normalized_path) > 260:
        return False, "路径长度超过Windows限制"

    # 检查路径是否包含非法字符
    invalid_chars = '<>:"|?*'
    if any(char in path.replace(":", "", 1) for char in invalid_chars):
        return False, "路径包含非法字符"

    # 获取驱动器根目录
    drive = os.path.splitdrive(normalized_path)[0]
    if not os.path.exists(drive):
        return False, f"驱动器 {drive} 不存在"

    # 检查父目录
    parent_dir = os.path.dirname(normalized_path)
    if parent_dir == drive:  # 如果父目录是驱动器根目录
        if not os.path.exists(drive):
            return False, f"驱动器 {drive} 不存在或无法访问"
    else:
        if not os.path.exists(parent_dir):
            return False, f"父目录不存在: {parent_dir}"

    # 检查目标路径
    if os.path.exists(normalized_path):
        if not os.path.isdir(normalized_path):
            return False, "指定路径已存在但不是一个目录"
        if os.listdir(normalized_path):
            return False, "目录已存在且不为空，请指定一个空目录或新目录"

    return True, ""


def _validate_unix_path(path: str) -> tuple[bool, str]:
    """Unix/Linux 系统的路径验证"""
    if not path.startswith("/"):
        return False, "Unix/Linux 路径必须以 / 开头"

    try:
        normalized_path = os.path.normpath(path)
    except Exception:
        return False, "路径格式不正确"

    # 检查路径是否包含非法字符
    if "\0" in normalized_path:
        return False, "路径包含非法字符"

    # 检查父目录
    parent_dir = os.path.dirname(normalized_path)
    if parent_dir == "/":  # 如果父目录是根目录
        if not os.path.exists("/"):
            return False, "根目录不可访问"
    else:
        if not os.path.exists(parent_dir):
            return False, f"父目录不存在: {parent_dir}"

    # 检查目标路径
    if os.path.exists(normalized_path):
        if not os.path.isdir(normalized_path):
            return False, "指定路径已存在但不是一个目录"
        if os.listdir(normalized_path):
            return False, "目录已存在且不为空，请指定一个空目录或新目录"

    # 检查权限
    try:
        parent = os.path.dirname(normalized_path)
        if os.path.exists(parent):
            # 检查是否有写入权限
            if not os.access(parent, os.W_OK):
                return False, f"没有父目录的写入权限: {parent}"
    except Exception:
        return False, "无法验证目录权限"

    return True, ""


def import_dataset(session: Session, project: Project):
    """导入数据集"""
    print(f"Importing data for project: {project.name}")
    original_dir = os.path.join(project.data_dir, "data", "original")

    # 获取所有图片文件
    image_files = []
    for root, _, files in os.walk(original_dir):
        for file in files:
            if any(file.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp"]):
                rel_path = os.path.relpath(os.path.join(root, file), original_dir)
                image_files.append(os.path.join("original", rel_path))

    print(f"Found {len(image_files)} image files")

    # 获取或创建默认任务
    task = session.exec(select(Task).where(Task.project_id == project.project_id)).first()
    if not task:
        task = Task(project_id=project.project_id)
        session.add(task)
        session.commit()

    # 创建数据记录
    for image_path in image_files:
        existing_data = session.exec(
            select(Data).where(
                Data.path == image_path,
                Data.task_id == task.task_id
            )
        ).first()

        if not existing_data:
            data = Data(
                path=image_path,
                task_id=task.task_id,
                project_id=project.project_id,
                processing_stage="original",
                metadata_={
                    "import_time": datetime.now(timezone.utc).isoformat(),
                    "original_path": image_path
                }
            )
            session.add(data)

    session.commit()
    print("Data import completed")


class UploadResponse(BaseModel):
    """Upload response schema"""
    message: str
    uploaded_files: List[str]


@router.get("/", response_model=List[ProjectOut])
def read_all_projects(
    session: SessionDep,
    order_by: str = "modified desc",
) -> Any:
    """获取所有项目"""
    order = parse_order_by(Project, order_by)
    projects = session.exec(select(Project).order_by(order)).all()
    return [ProjectOut.model_validate(project) for project in projects]


# 添加默认工作流配置
DEFAULT_WORKFLOW_CONFIG = {
    "nodes": [
        {
            "id": "source_1",
            "type": "image_source",
            "name": "图像源",
            "params": {}
        },
        {
            "id": "preprocess_1",
            "type": "preprocess",
            "name": "预处理",
            "params": {
                "resize": [416, 416]
            }
        }
    ],
    "edges": [
        {
            "source": "source_1",
            "target": "preprocess_1"
        }
    ]
}

@router.post("/", response_model=ProjectOut)
def create_project(
    *,
    session: SessionDep,
    project_in: ProjectCreate,
) -> Any:
    """创建新项目"""
    # 检查项目名称是否已存在
    existing_project = session.exec(
        select(Project).where(Project.name == project_in.name)
    ).first()
    if existing_project:
        raise HTTPException(
            status_code=409,
            detail="A project with this name already exists",
        )

    # 构建完整的数据目录路径
    full_data_dir = os.path.join(settings.DATA_ROOT_PATH, project_in.data_dir)

    # 检查数据目录是否已被使用
    existing_data_dir = session.exec(
        select(Project).where(Project.data_dir == full_data_dir)
    ).first()
    if existing_data_dir:
        raise HTTPException(
            status_code=409,
            detail="This data directory is already in use by another project",
        )

    # 检查任务类别是否有效
    if project_in.task_category_id is not None:
        if not 0 <= project_in.task_category_id <= 6:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid task category ID: {project_in.task_category_id}. Must be between 0 and 6.",
            )

    # 验证数目录
    is_valid, error_message = validate_directory_path(full_data_dir)
    if not is_valid:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid data directory: {error_message}",
        )

    # 创建数据目录
    try:
        project_data = project_in.model_dump()
        project_data["data_dir"] = full_data_dir
        project = Project(**project_data)
        
        # 创建项目目录结构
        data_dir = Path(full_data_dir)
        data_dir.mkdir(parents=True, exist_ok=True)
        
        # 创建数据子目录
        (data_dir / "data" / "original").mkdir(parents=True, exist_ok=True)
        (data_dir / "data" / "preprocessed").mkdir(parents=True, exist_ok=True)
        (data_dir / "data" / "results").mkdir(parents=True, exist_ok=True)
        
        # 创建标记文件
        (data_dir / ".projectdir").touch()

        session.add(project)
        session.commit()
        session.refresh(project)

        # 创建默认工作流
        workflow = Workflow(
            name=f"Workflow-{project.project_id}",
            project_id=project.project_id,
            config=DEFAULT_WORKFLOW_CONFIG
        )
        session.add(workflow)
        session.commit()

        return ProjectOut.model_validate(project)
    except Exception as e:
        session.rollback()
        # 清理已创建的目录
        if data_dir.exists():
            try:
                for path in data_dir.glob("**/*"):
                    if path.is_file():
                        path.unlink()
                for path in reversed(list(data_dir.glob("**/*"))):
                    if path.is_dir():
                        path.rmdir()
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, session: SessionDep) -> Any:
    """获取项目详情"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectOut.model_validate(project)


@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    *,
    session: SessionDep,
    project_id: int,
    project_update: ProjectUpdate,
) -> Any:
    """更新项目"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    project.modified = datetime.now(timezone.utc)
    session.add(project)
    session.commit()
    session.refresh(project)
    return ProjectOut.model_validate(project)


@router.delete("/{project_id}")
def delete_project(
    *,
    session: SessionDep,
    project_id: int,
) -> Dict:
    """删除项目"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        # 删除项目目录
        data_dir = Path(project.data_dir)
        if data_dir.exists():
            try:
                for path in data_dir.glob("**/*"):
                    if path.is_file():
                        path.unlink()
                for path in reversed(list(data_dir.glob("**/*"))):
                    if path.is_dir():
                        path.rmdir()
                data_dir.rmdir()
            except Exception as e:
                logger.error(f"Error deleting project directory: {str(e)}")

        # 删除数据库记录
        session.delete(project)
        session.commit()
        return {"message": "Project deleted successfully"}

    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")


@router.post("/{project_id}/upload")
async def upload_project_files(
    project_id: int,
    session: SessionDep,
    files: List[UploadFile] = File(...),
) -> UploadResponse:
    """上传项目文件"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        original_dir = os.path.join(project.data_dir, "data", "original")
        os.makedirs(original_dir, exist_ok=True)

        uploaded_files = []
        for file in files:
            if not file.content_type.startswith("image/"):
                continue

            filename = handle_duplicate_filename(original_dir, file.filename)
            file_path = os.path.join(original_dir, filename)

            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)

            relative_path = os.path.join("original", filename)
            uploaded_files.append(relative_path)

        if uploaded_files:
            import_dataset(session, project)
            return UploadResponse(
                message="Files uploaded successfully",
                uploaded_files=uploaded_files
            )
        else:
            raise HTTPException(status_code=400, detail="No valid image files were uploaded")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{project_id}/data")
async def get_project_data(
    project_id: int,
    session: SessionDep,
    stage: Optional[str] = None,
    category: Optional[str] = None,
) -> List[Dict]:
    """获取项目数据"""
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = select(Data).where(Data.project_id == project_id)
    if stage:
        query = query.where(Data.processing_stage == stage)
    if category:
        query = query.where(Data.category == category)

    data = session.exec(query).all()
    return [d.model_dump() for d in data]


def handle_duplicate_filename(base_path: str, filename: str) -> str:
    """处理重复文件名，通过添加数字后缀的方式"""
    name, ext = osp.splitext(filename)
    counter = 1
    new_filename = filename

    while osp.exists(osp.join(base_path, new_filename)):
        new_filename = f"{name}_{counter}{ext}"
        counter += 1

    return new_filename
