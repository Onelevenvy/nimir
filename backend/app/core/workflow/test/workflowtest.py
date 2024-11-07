import sys

sys.path.append("./")
from app.api.routes.workflows import execute_workflow_async
from sqlmodel import Session, create_engine, select
from app.models.workflow import Workflow, WorkflowExecution
from app.models.project import Project
from app.models.data import Data
import asyncio
import os
from pathlib import Path


def get_url():
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "nimir123456")
    server = os.getenv("POSTGRES_SERVER", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB", "nimir")
    return f"postgresql+psycopg://{user}:{password}@{server}:{port}/{db}"


async def test_workflow():
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
                        "path": "/home/tqx/llm/testdata/ocr_20241029_151039/data/original",
                    },
                },
                {
                    "name": "preprocess",
                    "type": "preprocess",
                    "params": {"resize": [416, 416]},
                },
                {
                    "name": "instance_segmentation",
                    "type": "instance_segmentation",
                    "params": {"confidence": 0.5},
                },
                {
                    "name": "semantic_segmentation",
                    "type": "semantic_segmentation",
                    "params": {
                        "classes": ["background", "person", "car", "road", "building"]
                    },
                },
            ],
            "edges": [
                {"source": "image_source", "target": "preprocess"},
                {"source": "preprocess", "target": "instance_segmentation"},
                {"source": "preprocess", "target": "semantic_segmentation"},
            ],
        }

        workflow = Workflow(
            name="Test Workflow",
            description="Test workflow for segmentation",
            project_id=project.project_id,
            config=workflow_config,
        )
        session.add(workflow)
        session.commit()
        print(f"Created workflow with ID: {workflow.workflow_id}")

        execution = WorkflowExecution(
            workflow_id=workflow.workflow_id,
            project_id=project.project_id,
            status="pending",
            config=workflow_config,
        )
        session.add(execution)
        session.commit()
        print(f"Created execution with ID: {execution.execution_id}")

        await execute_workflow_async(execution.execution_id, session)

        execution = session.get(WorkflowExecution, execution.execution_id)
        print(f"\nExecution status: {execution.status}")

        if execution.status == "completed":
            for node_execution in execution.node_executions:
                print(f"\nNode: {node_execution.node_id}")
                print(f"Status: {node_execution.status}")
                print(f"Output data count: {len(node_execution.output_data_ids)}")

                for processed_data in node_execution.processed_data:
                    print(f"Processed file: {Path(processed_data.file_path).name}")

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        session.close()


async def test_single_node():
    """测试单节点执行"""
    engine = create_engine(get_url())
    session = Session(engine)

    try:
        # 1. 获取项目
        project = session.exec(select(Project)).first()
        if not project:
            print("No project found!")
            return

        # 2. 创建工作流配置
        # workflow_config = {
        #     "nodes": [
        #         {
        #             "name": "image_source",
        #             "type": "image_source",
        #             "params": {
        #                 "source_type": "file",
        #                 "path": "/Users/envys/aidata/det_20241029_162744/data/original",
        #             },
        #         },
        #         {
        #             "name": "preprocess",
        #             "type": "preprocess",
        #             "params": {"resize": [416, 416]},
        #         },
        #         {
        #             "name": "object_detection",
        #             "type": "object_detection",
        #             "params": {"model": "yolov8n.pt", "confidence": 0.5},
        #         },
        #     ],
        #     "edges": [
        #         {"source": "image_source", "target": "preprocess"},
        #         {"source": "preprocess", "target": "object_detection"},
        #     ],
        # }

        workflow_config = {
            "nodes": [
                {
                    "name": "image_source",
                    "type": "image_source",
                    "params": {
                        "source_type": "file",
                        "path": "/Users/envys/aidata/tqx_20241106_144455/data/original",
                    },
                },
                {
                    "name": "preprocess",
                    "type": "preprocess",
                    "params": {"resize": [416, 416]},
                },
                {
                    "name": "instance_segmentation",
                    "type": "instance_segmentation",
                    "params": {"confidence": 0.5},
                },
                # {
                #     "name": "semantic_segmentation",
                #     "type": "semantic_segmentation",
                #     "params": {
                #         "classes": ["background", "person", "car", "road", "building"]
                #     },
                # },
            ],
            "edges": [
                {"source": "image_source", "target": "preprocess"},
                {"source": "preprocess", "target": "instance_segmentation"},
                # {"source": "preprocess", "target": "semantic_segmentation"},
            ],
        }

        # 3. 创建工作流
        workflow = Workflow(
            name="Test Single Node Workflow",
            description="Test workflow for single node execution",
            project_id=project.project_id,
            config=workflow_config,
        )
        session.add(workflow)
        session.commit()
        print(f"Created workflow with ID: {workflow.workflow_id}")

        # 4. 创建执行记录
        execution = WorkflowExecution(
            workflow_id=workflow.workflow_id,
            project_id=project.project_id,
            status="pending",
            config=workflow_config,
        )
        session.add(execution)
        session.commit()
        print(f"Created execution with ID: {execution.execution_id}")

        from app.api.routes.workflows import execute_single_node

        # 5. 执行图像源节点
        print("\nExecuting image source node...")
        result = await execute_single_node(
            execution.execution_id, "image_source", session
        )
        print(f"Image source node result: {result}")

        # 6. 执行预处理节点
        print("\nExecuting preprocess node...")
        result = await execute_single_node(
            execution.execution_id, "preprocess", session
        )
        print(f"Preprocess node result: {result}")

        # 7. 执行目标检测节点
        print("\nExecuting object detection node...")
        result = await execute_single_node(
            execution.execution_id, "object_detection", session
        )
        print(f"Object detection node result: {result}")

        # 8. 查询最终结果
        execution = session.get(WorkflowExecution, execution.execution_id)
        print(f"\nFinal execution status: {execution.status}")

        for node_execution in execution.node_executions:
            print(f"\nNode: {node_execution.node_id}")
            print(f"Status: {node_execution.status}")
            print(f"Output data IDs: {node_execution.output_data_ids}")

            # 查看处理后的数据
            for processed_data in node_execution.processed_data:
                print(f"Processed data path: {processed_data.file_path}")
                print(f"Metadata: {processed_data.metadata_}")

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        session.close()


async def main():
    """运行所有测试"""
    # print("\n=== Testing full workflow execution ===")
    # await test_workflow()

    print("\n=== Testing single node execution ===")
    await test_single_node()


if __name__ == "__main__":
    asyncio.run(main())
