from typing import Any, Dict
from app.core.workflow.node_processors.base_processor import BaseNodeProcessor
from app.core.workflow.base_node import BaseNode
from app.models.workflow import WorkflowExecution, WorkflowNodeExecution, NodeStatus
from sqlmodel import Session, select
from app.core.workflow.data_manager import WorkflowDataManager
from app.core.workflow.tqx_state import WorkflowState

class ProcessorNodeAdapter(BaseNode):
    """适配器基类，将 NodeProcessor 转换为 langgraph 节点"""
    
    def __init__(
        self, 
        node_id: str,
        params: Dict[str, Any],
        workflow_config: Any,
        processor_class: type[BaseNodeProcessor],
        session: Session,
        execution: WorkflowExecution
    ):
        super().__init__(node_id, params, workflow_config)
        self.processor_class = processor_class
        self.session = session
        self.execution = execution
        self.data_manager = WorkflowDataManager(
            project_id=execution.project_id,
            execution_id=execution.execution_id,
            session=session
        )

    async def work_async(self, state: WorkflowState) -> WorkflowState:
        """langgraph 异步工作方法"""
        try:
            # 创建节点执行记录
            node_execution = WorkflowNodeExecution(
                execution_id=self.execution.execution_id,
                node_id=self.node_id,
                node_type=self.processor_class.__name__.replace('NodeProcessor', '').lower(),
                config=self.params
            )

            # 从前一个节点获取输入数据ID
            if self.node_id != "image_source":  # 图像源节点不需要输入
                input_node = self.get_input_node()
                if input_node:
                    # 从状态中获取前一个节点的输出
                    input_data_ids = state.data.get(f"output_data_ids_{input_node}")
                    if input_data_ids:
                        print(f"Using input data IDs from state: {input_data_ids}")
                        node_execution.input_data_ids = input_data_ids
                    else:
                        # 如果状态中没有，尝试从数据库获取
                        latest_source_execution = self.session.exec(
                            select(WorkflowNodeExecution)
                            .where(
                                WorkflowNodeExecution.execution_id == self.execution.execution_id,
                                WorkflowNodeExecution.node_id == input_node,
                                WorkflowNodeExecution.status == NodeStatus.COMPLETED,
                            )
                            .order_by(WorkflowNodeExecution.completed_at.desc())
                        ).first()

                        if latest_source_execution and latest_source_execution.output_data_ids:
                            print(f"Using input data IDs from database: {latest_source_execution.output_data_ids}")
                            node_execution.input_data_ids = latest_source_execution.output_data_ids
                        else:
                            print(f"No input data found for node: {self.node_id}")

            self.session.add(node_execution)
            self.session.commit()

            # 创建处理器实例
            processor = self.processor_class(
                node_execution=node_execution,
                session=self.session,
                data_manager=self.data_manager
            )

            # 执行处理
            output_data_ids = await processor.process()

            # 更新节点执行状态
            node_execution.status = NodeStatus.COMPLETED
            node_execution.output_data_ids = output_data_ids
            self.session.add(node_execution)
            self.session.commit()

            # 创建新的状态
            new_data = state.data.copy()
            new_data[f"output_data_ids_{self.node_id}"] = output_data_ids
            return WorkflowState(data=new_data)

        except Exception as e:
            print(f"Error in {self.node_id}: {str(e)}")
            if node_execution:
                node_execution.status = NodeStatus.FAILED
                node_execution.error_message = str(e)
                self.session.add(node_execution)
                self.session.commit()
            raise