import { useQuery, useMutation, useQueryClient } from "react-query";
import { WorkflowsService } from "@/client";
import useCustomToast from "./useCustomToast";
import { CustomNode } from "@/components/WorkFlow/nodeConfig";
import { Edge } from "reactflow";

export function useWorkflow(projectId?: number) {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  // 获取项目的工作流列表
  const { data: workflows, isLoading } = useQuery(
    ["workflows", projectId],
    () => WorkflowsService.getProjectWorkflow({ projectId: projectId! }),
    {
      enabled: !!projectId,
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to load workflows",
          "error"
        );
      },
    }
  );

  // 保存工作流配置
  const saveWorkflowConfig = (nodes: CustomNode[], edges: Edge[]) => {
    const workflowConfig = {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        name: node.data.label,
        params: node.data.params || {},
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
      })),
    };

    return workflowConfig;
  };

  // 创建工作流
  const createWorkflow = useMutation<
    any,
    Error,
    { nodes: CustomNode[]; edges: Edge[] }
  >(
    async ({ nodes, edges }) => {
      const config = saveWorkflowConfig(nodes, edges);
      const response = await WorkflowsService.createWorkflow({
        requestBody: {
          name: `Workflow-${projectId}`,
          project_id: projectId!,
          config: config,
        },
      });
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["workflows", projectId]);
        showToast("Success", "Workflow created successfully", "success");
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to create workflow",
          "error"
        );
      },
    }
  );

  // 更新工作流
  const updateWorkflow = useMutation<
    any,
    Error,
    { workflowId: number; nodes: CustomNode[]; edges: Edge[] }
  >(
    async ({ workflowId, nodes, edges }) => {
      const config = saveWorkflowConfig(nodes, edges);
      const response = await WorkflowsService.updateWorkflow({
        workflowId,
        requestBody: {
          config,
        },
      });
      return response;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["workflows", projectId]);
        showToast("Success", "Workflow updated successfully", "success");
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to update workflow",
          "error"
        );
      },
    }
  );

  // 执行工作流
  const executeWorkflow = useMutation<any, Error, number>(
    async (workflowId) => {
      const response = await WorkflowsService.executeWorkflow({ workflowId });
      return response;
    },
    {
      onSuccess: (data) => {
        showToast("Success", "Workflow execution started", "success");
        return data;
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to execute workflow",
          "error"
        );
      },
    }
  );

  // 执行单个节点
  const executeSingleNode = useMutation<
    any,
    Error,
    { workflowId: number; nodeId: string }
  >(
    async ({ workflowId, nodeId }) => {
      const response = await WorkflowsService.executeSingleNode({
        workflowId,
        nodeId,
      });
      return response;
    },
    {
      onSuccess: (data) => {
        showToast("Success", "Node execution started", "success");
        return data;
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to execute node",
          "error"
        );
      },
    }
  );

  // 获取执行状态
  const getExecutionStatus = useMutation<any, Error, number>(
    async (executionId) => {
      const response = await WorkflowsService.getExecutionStatus({
        executionId,
      });
      return response;
    },
    {
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to get execution status",
          "error"
        );
      },
    }
  );

  // 获取节点执行状态
  const getNodeExecutionStatus = useMutation<
    any,
    Error,
    { executionId: number; nodeId: string }
  >(
    async ({ executionId, nodeId }) => {
      const response = await WorkflowsService.getNodeExecutionStatus({
        executionId,
        nodeId,
      });
      return response;
    },
    {
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to get node execution status",
          "error"
        );
      },
    }
  );

  return {
    workflows,
    isLoading,
    createWorkflow,
    updateWorkflow,
    executeWorkflow,
    executeSingleNode,
    getExecutionStatus,
    getNodeExecutionStatus,
  };
}
