import sys

sys.path.append("./")
from sqlmodel import Session, create_engine, select
from app.models.workflow import Workflow, WorkflowExecution
from app.models.project import Project
import asyncio
import os
from app.api.routes.workflows import execute_graph_workflow
from app.core.workflow.tqx_state import WorkflowState
from app.core.workflow.build_workflow import create_langgraph_workflow


def get_url():
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "nimir123456")
    server = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "nimir")
    return f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"


async def test_workflow():
    """测试完整工作流执行 - 使用 langgraph"""
    engine = create_engine(get_url())
    session = Session(engine)

    try:
        project = session.exec(select(Project)).first()
        if not project:
            print("No project found!")
            return

        workflow_config = {
            "nodes": [
                {
                    "name": "image_source1",
                    "type": "image_source",
                    "params": {
                        "source_type": "file",
                        "path": "/home/tqx/llm/testdata/seg_20241030_091228/data/original",
                    },
                },
                {
                    "name": "preprocess2",
                    "type": "preprocess",
                    "params": {"resize": [416, 416]},
                },
                {
                    "name": "instance_segmentation3",
                    "type": "instance_segmentation",
                    "params": {"confidence": 0.5},
                },
            ],
            "edges": [
                {"source": "image_source1", "target": "preprocess2"},
                {"source": "preprocess2", "target": "instance_segmentation3"},
            ],
        }

        workflow = Workflow(
            name="Test LangGraph Workflow",
            description="Test workflow using LangGraph",
            project_id=project.project_id,
            config=workflow_config,
        )
        session.add(workflow)
        session.commit()
        print(f"Created workflow with ID: {workflow.workflow_id}")

        # 创建执行记录
        execution = WorkflowExecution(
            workflow_id=workflow.workflow_id,
            project_id=project.project_id,
            status="pending",
            config=workflow_config,
        )
        session.add(execution)
        session.commit()
        print(f"Created execution with ID: {execution.execution_id}")

        # 直接创建和执行工作流图
        graph = create_langgraph_workflow(
            config=workflow_config, session=session, execution=execution, use_async=True
        )

        # 创建初始状态并执行
        initial_state = WorkflowState(data={})
        await execute_graph_workflow(
            graph=graph,
            initial_state=initial_state,
            execution_id=execution.execution_id,
            session=session,
        )

        # 检查执行结果
        execution = session.get(WorkflowExecution, execution.execution_id)
        print(f"\nExecution status: {execution.status}")

        if execution.status == "completed":
            for node_execution in execution.node_executions:
                print(f"\nNode: {node_execution.node_id}")
                print(f"Status: {node_execution.status}")
                print(f"Output data count: {len(node_execution.output_data_ids)}")

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        session.close()


async def test_single_node():
    """测试单节点执行"""
    engine = create_engine(get_url())
    session = Session(engine)

    try:
        project = session.exec(select(Project)).first()
        if not project:
            print("No project found!")
            return

        workflow_config = {
            "nodes": [
                {
                    "name": "image_source",
                    "type": "image_source",
                    "params": {
                        "source_type": "file",
                        "path": "/home/tqx/llm/testdata/seg_20241030_091228/data/original",
                    },
                },
            ],
            "edges": [],
        }

        workflow = Workflow(
            name="Test Single Node Workflow",
            description="Test workflow for single node execution",
            project_id=project.project_id,
            config=workflow_config,
        )
        session.add(workflow)
        session.commit()
        print(f"Created workflow with ID: {workflow.workflow_id}")

        # 创建执行记录
        execution = WorkflowExecution(
            workflow_id=workflow.workflow_id,
            project_id=project.project_id,
            status="pending",
            config=workflow_config,
        )
        session.add(execution)
        session.commit()
        print(f"Created execution with ID: {execution.execution_id}")

        # 创建和执行单个节点的工作流图
        graph = create_langgraph_workflow(
            config=workflow_config, session=session, execution=execution, use_async=True
        )

        initial_state = WorkflowState(data={})
        await execute_graph_workflow(
            graph=graph,
            initial_state=initial_state,
            execution_id=execution.execution_id,
            session=session,
        )

        # 检查执行结果
        execution = session.get(WorkflowExecution, execution.execution_id)
        print(f"\nExecution status: {execution.status}")

        if execution.status == "completed":
            for node_execution in execution.node_executions:
                print(f"\nNode: {node_execution.node_id}")
                print(f"Status: {node_execution.status}")
                print(f"Output data count: {len(node_execution.output_data_ids)}")

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        session.close()


async def main():
    """运行所有测试"""
    print("\n=== Testing full workflow execution ===")
    await test_workflow()

    print("\n=== Testing single node execution ===")
    await test_single_node()


if __name__ == "__main__":
    asyncio.run(main())
