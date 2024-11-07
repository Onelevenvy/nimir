# backend/app/api/routes/workflows.py

from typing import List, Any, Optional, Dict
from fastapi import APIRouter, HTTPException, BackgroundTasks
from sqlmodel import Session, select
from app.api.deps import SessionDep, CurrentSuperUser
from app.models.workflow import (
    Workflow,
    WorkflowCreate,
    WorkflowOut,
    WorkflowUpdate,
    WorkflowExecution,
    WorkflowNodeExecution,
    ProcessedData,
    NodeStatus,
)
from app.models.data import Data
from app.core.workflow.build_workflow import (
    validate_workflow_config,
    create_langgraph_workflow,
)
from app.core.workflow.data_manager import WorkflowDataManager
from datetime import datetime, timezone
from app.core.workflow.node_processors import NODE_PROCESSORS
from app.core.workflow.tqx_state import WorkflowState
from app.core.workflow.node_processors.image_source_processor import (
    ImageSourceNodeProcessor,
)
from app.core.workflow.node_processors.preprocess_processor import (
    PreprocessNodeProcessor,
)
from app.core.workflow.node_processors.object_detection_processor import (
    ObjectDetectionNodeProcessor,
)
from app.core.workflow.node_processors.instance_segmentation_processor import (
    InstanceSegmentationNodeProcessor,
)
from app.core.workflow.node_processors.semantic_segmentation_processor import (
    SemanticSegmentationNodeProcessor,
)
from app.core.workflow.node_processors.classification_processor import (
    ClassificationNodeProcessor,
)
from app.core.workflow.node_processors.base_processor import BaseNodeProcessor
import os

router = APIRouter()

# 添加节点处理器映射
NODE_PROCESSORS = {
    "image_source": ImageSourceNodeProcessor,
    "preprocess": PreprocessNodeProcessor,
    "object_detection": ObjectDetectionNodeProcessor,
    "instance_segmentation": InstanceSegmentationNodeProcessor,
    "semantic_segmentation": SemanticSegmentationNodeProcessor,
    "classification": ClassificationNodeProcessor,
}


def get_node_processor(node_type: str) -> type[BaseNodeProcessor]:
    """获取节点处理器类"""
    processor = NODE_PROCESSORS.get(node_type)
    if not processor:
        raise ValueError(f"No processor found for node type: {node_type}")
    return processor


async def process_node(
    node_execution: WorkflowNodeExecution,
    execution: WorkflowExecution,
    session: Session,
    data_manager: WorkflowDataManager,
) -> None:
    """处理单个节点"""
    try:
        print(
            f"\nProcessing node: {node_execution.node_id} ({node_execution.node_type})"
        )

        # 确保从数据库获取完整的对象
        node_execution = session.get(WorkflowNodeExecution, node_execution.id)
        execution = session.get(WorkflowExecution, execution.execution_id)

        # 获取节点处理器
        processor_class = get_node_processor(node_execution.node_type)
        if not processor_class:
            raise ValueError(
                f"No processor found for node type: {node_execution.node_type}"
            )

        processor = processor_class(node_execution, session, data_manager)

        # 处理节点
        output_data_ids = await processor.process()

        # 更新节点状态
        node_execution.status = NodeStatus.COMPLETED
        node_execution.output_data_ids = output_data_ids
        node_execution.completed_at = datetime.now(timezone.utc)
        session.add(node_execution)

        # 更新执行状态
        execution.status = NodeStatus.COMPLETED
        execution.completed_at = datetime.now(timezone.utc)
        session.add(execution)

        session.commit()
        print(f"Node {node_execution.node_id} processed {len(output_data_ids)} items")

    except Exception as e:
        print(f"Error processing node {node_execution.node_id}: {str(e)}")
        import traceback

        traceback.print_exc()
        node_execution.status = NodeStatus.FAILED
        node_execution.error_message = str(e)
        execution.status = NodeStatus.FAILED
        execution.error_message = str(e)
        session.add(node_execution)
        session.add(execution)
        session.commit()


async def execute_workflow_async(execution_id: int, session: Session) -> None:
    """异步执行工作流"""
    execution = session.get(WorkflowExecution, execution_id)
    if not execution or not execution.config.get("nodes"):
        return

    try:
        data_manager = WorkflowDataManager(execution.project_id, execution_id, session)
        
        # 检查是否是单节点执行
        if len(execution.config["nodes"]) == 1:
            # 单节点执行，直接返回
            return
            
        # 多节点执行的逻辑...

        execution.status = "completed"
        execution.completed_at = datetime.now(timezone.utc)

    except Exception as e:
        print(f"Workflow execution error: {str(e)}")
        execution.status = "failed"
        execution.error_message = str(e)
        execution.completed_at = datetime.now(timezone.utc)
    finally:
        session.add(execution)
        session.commit()


@router.post("/", response_model=WorkflowOut)
def create_workflow(
    *,
    session: SessionDep,
    workflow_in: WorkflowCreate,
) -> Any:
    try:
        validate_workflow_config(workflow_in.config)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    workflow = Workflow(**workflow_in.model_dump())
    session.add(workflow)
    session.commit()
    session.refresh(workflow)
    return workflow


@router.get("/{workflow_id}", response_model=WorkflowOut)
def get_workflow(workflow_id: int, session: SessionDep) -> Any:
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.post("/{workflow_id}/execute")
async def execute_workflow(
    workflow_id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> Dict:
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution = WorkflowExecution(
        workflow_id=workflow_id,
        project_id=workflow.project_id,
        status="pending",
        config=workflow.config,
    )
    session.add(execution)
    session.commit()
    session.refresh(execution)

    # 启动异步执行
    background_tasks.add_task(execute_workflow_async, execution.execution_id, session)

    return {
        "message": "Workflow execution started",
        "execution_id": execution.execution_id,
    }


@router.get("/execution/{execution_id}/status")
async def get_execution_status(
    execution_id: int,
    session: SessionDep,
) -> Dict:
    execution = session.get(WorkflowExecution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    # 获取所有节点的状态
    node_statuses = {}
    for node in execution.node_executions:
        node_statuses[node.node_id] = {
            "status": node.status,
            "started_at": node.started_at,
            "completed_at": node.completed_at,
            "error_message": node.error_message,
        }

    return {
        "execution_id": execution_id,
        "status": execution.status,
        "started_at": execution.started_at,
        "completed_at": execution.completed_at,
        "error_message": execution.error_message,
        "nodes": node_statuses,
    }


@router.get("/execution/{execution_id}/data/{stage}")
async def get_execution_stage_data(
    execution_id: int,
    stage: str,
    session: SessionDep,
    category: Optional[str] = None,
) -> List[Dict]:
    """获取工作流执行特定阶段的数据"""
    query = select(Data).where(
        Data.workflow_execution_id == execution_id, Data.processing_stage == stage
    )

    if category:
        query = query.where(Data.category == category)

    data = session.exec(query).all()
    return [d.model_dump() for d in data]


@router.get("/node/{node_execution_id}/data")
async def get_node_data(
    node_execution_id: int,
    session: SessionDep,
) -> List[Dict]:
    """获取节点处理的数据"""
    node_execution = session.get(WorkflowNodeExecution, node_execution_id)
    if not node_execution:
        raise HTTPException(status_code=404, detail="Node execution not found")

    data = session.exec(
        select(Data).where(Data.node_execution_id == node_execution_id)
    ).all()

    return [d.model_dump() for d in data]


@router.post("/{workflow_id}/execute_node")
async def execute_single_node(
    workflow_id: int,
    node_id: str,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> Dict:
    """执行单个节点"""
    print(f"\n{'='*50}")
    print(f"Starting execution of node: {node_id}")
    print(f"{'='*50}")

    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # 找到对应的节点配置
    node_config = next(
        (node for node in workflow.config["nodes"] if node["id"] == node_id), None
    )
    if not node_config:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")

    print(f"\nNode configuration:")
    print(f"- ID: {node_config['id']}")
    print(f"- Type: {node_config['type']}")
    print(f"- Parameters: {node_config.get('params', {})}")

    # 创建执行记录，只包含当前节点的配置
    current_edges = [
        edge for edge in workflow.config["edges"] if edge["target"] == node_id
    ]

    execution_config = {"nodes": [node_config], "edges": current_edges}

    print("\nExecution configuration:")
    print(f"- Nodes: {len(execution_config['nodes'])}")
    print(f"- Edges: {len(execution_config['edges'])}")

    execution = WorkflowExecution(
        workflow_id=workflow_id,
        project_id=workflow.project_id,
        status="pending",
        config=execution_config,
    )
    session.add(execution)
    session.commit()
    print(f"\nCreated execution record: {execution.execution_id}")

    # 创建节点执行记录
    node_execution = WorkflowNodeExecution(
        execution_id=execution.execution_id,
        node_id=node_id,
        node_type=node_config["type"],
        config=node_config,
    )
    session.add(node_execution)
    session.commit()
    print(f"Created node execution record: {node_execution.id}")

    # 如果不是图像源节点，查找输入数据
    if node_config["type"] != "image_source":
        print("\nSearching for input data...")
        input_data_ids = await get_input_data_ids(
            node_id, node_config, workflow, node_execution, session
        )

        if input_data_ids:
            print(f"Found {len(input_data_ids)} input data items")
            # 设置节点执行记录的输入数据IDs
            node_execution.input_data_ids = input_data_ids
            session.add(node_execution)
            session.commit()
        else:
            print("No input data found")

    # 启动节点处理
    print("\nStarting node processing...")
    data_manager = WorkflowDataManager(
        workflow.project_id, execution.execution_id, session
    )

    # 只处理当前节点
    processor_class = get_node_processor(node_config["type"])
    processor = processor_class(node_execution, session, data_manager)
    output_data_ids = await processor.process()

    # 更新节点状态
    node_execution.status = NodeStatus.COMPLETED
    node_execution.output_data_ids = output_data_ids
    node_execution.completed_at = datetime.now(timezone.utc)
    session.add(node_execution)

    # 更新执行状态
    execution.status = NodeStatus.COMPLETED
    execution.completed_at = datetime.now(timezone.utc)
    session.add(execution)

    session.commit()
    print(f"\nNode {node_id} execution completed with {len(output_data_ids)} outputs")

    return {
        "message": f"Node {node_id} execution completed",
        "execution_id": execution.execution_id,
        "node_execution_id": node_execution.id,
        "output_data_ids": output_data_ids,
    }


async def get_input_data_ids(
    node_id: str,
    node_config: Dict,
    workflow: Workflow,
    node_execution: WorkflowNodeExecution,
    session: Session,
) -> List[int]:
    """获取节点的输入数据ID列表"""
    input_data_ids = []
    input_edges = [
        edge for edge in workflow.config["edges"] if edge["target"] == node_id
    ]
    print(f"Found {len(input_edges)} input edges")

    for edge in input_edges:
        source_node = next(
            (node for node in workflow.config["nodes"] if node["id"] == edge["source"]),
            None,
        )
        if source_node:
            print(
                f"\nProcessing source node: {source_node['id']} ({source_node['type']})"
            )

            if source_node["type"] == "image_source":
                data_ids = await handle_image_source_input(
                    workflow, node_execution, session
                )
            else:
                data_ids = await handle_normal_node_input(
                    source_node, node_execution, session
                )

            input_data_ids.extend(data_ids)

    return input_data_ids


@router.post("/{workflow_id}/execute_graph")
async def execute_workflow_graph(
    workflow_id: int,
    background_tasks: BackgroundTasks,
    session: SessionDep,
) -> Dict:
    """使用 langgraph 执行工作流（支持并行执行）"""
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        # 创建执行记录
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            project_id=workflow.project_id,
            status="pending",
            config=workflow.config,
        )
        session.add(execution)
        session.commit()

        # 创建工作流图
        graph = create_langgraph_workflow(
            config=workflow.config, session=session, execution=execution, use_async=True
        )

        # 创建初始状态
        initial_state = WorkflowState(data={})

        # 异步执行工作流
        background_tasks.add_task(
            execute_graph_workflow,
            graph=graph,
            initial_state=initial_state,
            execution_id=execution.execution_id,
            session=session,
        )

        return {
            "message": "Graph workflow execution started",
            "execution_id": execution.execution_id,
        }

    except Exception as e:
        print(f"Error starting graph workflow execution: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/execution/{execution_id}/node/{node_id}/status")
async def get_node_execution_status(
    execution_id: int,
    node_id: str,
    session: SessionDep,
) -> Dict:
    """获取节点执行状态"""
    node_execution = session.exec(
        select(WorkflowNodeExecution).where(
            WorkflowNodeExecution.execution_id == execution_id,
            WorkflowNodeExecution.node_id == node_id,
        )
    ).first()

    if not node_execution:
        raise HTTPException(status_code=404, detail="Node execution not found")

    return {
        "node_id": node_id,
        "status": node_execution.status,
        "started_at": node_execution.started_at,
        "completed_at": node_execution.completed_at,
        "error_message": node_execution.error_message,
        "input_data_ids": node_execution.input_data_ids,
        "output_data_ids": node_execution.output_data_ids,
    }


@router.post("/execution/{execution_id}/retry")
async def retry_workflow_execution(
    execution_id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
) -> Dict:
    """重试失败的工作流执行"""
    execution = session.get(WorkflowExecution, execution_id)
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")

    if execution.status != "failed":
        raise HTTPException(
            status_code=400, detail="Only failed executions can be retried"
        )

    # 重置执行状态
    execution.status = "pending"
    execution.error_message = None
    execution.started_at = datetime.now(timezone.utc)
    execution.completed_at = None

    # 重置所有失败节点的状态
    for node in execution.node_executions:
        if node.status == NodeStatus.FAILED:
            node.status = NodeStatus.PENDING
            node.error_message = None
            node.started_at = None
            node.completed_at = None

    session.add(execution)
    session.commit()

    # 重新启动执行
    background_tasks.add_task(execute_workflow_async, execution.execution_id, session)

    return {"message": "Workflow execution retry started", "execution_id": execution_id}


async def execute_graph_workflow(
    graph: Any,
    initial_state: WorkflowState,
    execution_id: int,
    session: Session,
) -> None:
    """异步执行 langgraph 工作流"""
    try:
        execution = session.get(WorkflowExecution, execution_id)
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")

        # 执行工作流图
        final_state = await graph.ainvoke(initial_state)

        # 更新执行状态
        execution.status = "completed"
        execution.completed_at = datetime.now(timezone.utc)
        session.add(execution)
        session.commit()

        print(f"Graph workflow execution completed: {final_state}")

    except Exception as e:
        print(f"Error executing graph workflow: {str(e)}")
        if execution:
            execution.status = "failed"
            execution.error_message = str(e)
            execution.completed_at = datetime.now(timezone.utc)
            session.add(execution)
            session.commit()


@router.get("/project/{project_id}", response_model=WorkflowOut)
def get_project_workflow(project_id: int, session: SessionDep) -> Any:
    """获取项目的工作流"""
    workflow = session.exec(
        select(Workflow).where(Workflow.project_id == project_id)
    ).first()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowOut)
def update_workflow(
    workflow_id: int,
    workflow_update: WorkflowUpdate,
    session: SessionDep,
) -> Any:
    """更新工作流"""
    workflow = session.get(Workflow, workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    try:
        update_data = workflow_update.model_dump(exclude_unset=True)

        # 确保配置被完全更新
        if "config" in update_data:
            workflow.config = update_data["config"]

        workflow.modified = datetime.now(timezone.utc)
        session.add(workflow)
        session.commit()
        session.refresh(workflow)

        return workflow
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail=f"Failed to update workflow: {str(e)}"
        )


async def handle_image_source_input(
    workflow: Workflow, node_execution: WorkflowNodeExecution, session: Session
) -> List[int]:
    """处理图像源节点的输入数据"""
    print("\nHandling image source input...")

    # 从 Data 表获取原始图片
    original_data = session.exec(
        select(Data).where(
            Data.project_id == workflow.project_id, Data.processing_stage == "original"
        )
    ).all()

    if not original_data:
        print("No original images found")
        return []

    print(f"Found {len(original_data)} original images:")
    for data in original_data:
        print(f"- {data.path} (ID: {data.data_id})")

    # 为每个原始图片创建 ProcessedData 记录
    processed_records = []
    for data in original_data:
        processed_data = ProcessedData(
            node_execution_id=node_execution.id,
            original_data_id=data.data_id,
            file_path=data.path,
            metadata_={
                "original_data_id": data.data_id,
                "filename": os.path.basename(data.path),
            },
        )
        session.add(processed_data)
        processed_records.append(processed_data)

    session.commit()
    print(f"Created {len(processed_records)} ProcessedData records for original images")

    return [record.id for record in processed_records]


async def handle_normal_node_input(
    source_node: Dict, 
    node_execution: WorkflowNodeExecution, 
    session: Session
) -> List[int]:
    """处理普通节点的输入数据"""
    print(f"Handling input from node: {source_node['id']}")

    # 直接从 Data 表查询上一个节点的最新数据
    query = (
        select(Data)
        .where(
            Data.processing_stage == source_node["id"],  # 使用节点ID作为processing_stage
            Data.workflow_execution_id != node_execution.execution_id  # 排除当前执行的数据
        )
        .order_by(Data.created.desc())
    )
    input_data = session.exec(query).all()

    if input_data:
        print(f"Found {len(input_data)} input data items from {source_node['type']}")
        for data in input_data:
            print(f"- Data ID: {data.data_id}, Path: {data.path}")
            
        # 为每个输入数据创建 ProcessedData 记录（用于追溯）
        processed_records = []
        for data in input_data:
            processed_data = ProcessedData(
                node_execution_id=node_execution.id,
                original_data_id=data.original_data_id,
                file_path=data.path,
                metadata_=data.metadata_
            )
            session.add(processed_data)
            processed_records.append(processed_data)
        
        session.commit()
        print(f"Created {len(processed_records)} ProcessedData records for tracking")
        
        # 返回 Data 记录的 ID
        return [data.data_id for data in input_data]
    else:
        print(f"No input data found from {source_node['type']}")
        return []
