import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Button,
  useToast,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { NodeType, CustomNode, nodeConfig } from "./nodeConfig";
import { useWorkflow } from "@/hooks/useWorkflow";
// import ImageSourceView from "./Views/ImageSourceView";

interface NodePropertiesProps {
  node: CustomNode;
}

const NodeProperties: React.FC<NodePropertiesProps> = ({ node }) => {
  const toast = useToast();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [localNode, setLocalNode] = useState(node);
  const { executeWorkflow, executeSingleNode } = useWorkflow();

  useEffect(() => {
    setLocalNode(node);
  }, [node]);

  const handleExecuteNode = async () => {
    if (node.type === "image_source") {
      toast({
        title: "执行成功",
        description: "图像源节点已准备就绪",
        status: "success",
        duration: 3000,
      });
      return;
    }

    if (!node.data.workflowId) {
      toast({
        title: "执行失败",
        description: "请先保存工作流",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsExecuting(true);
    setExecutionError(null);

    try {
      // 执行工作流
      const workflowResponse = await executeWorkflow.mutateAsync(
        node.data.workflowId
      );
      const executionId = workflowResponse.execution_id;

      // 执行单个节点
      const result = await executeSingleNode.mutateAsync({
        workflowId: node.data.workflowId,
        nodeId: node.id,
      });

      console.log("Node execution result:", result);

      // 通知父组件更新视图
      if (node.data.onChange) {
        node.data.onChange("executionResult", result);
      }

      toast({
        title: "执行成功",
        description: "节点执行完成",
        status: "success",
      });
    } catch (error) {
      console.error("Execute node error:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      setExecutionError(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  };

  const getNodePropertiesComponent = (node: CustomNode | null) => {
    if (!node || !node.data) return null;

    const nodeType = node.type as NodeType;
    const PropertiesComponent = nodeConfig[nodeType]?.properties;
    if (!PropertiesComponent) return null;

    const commonProps = {
      node: localNode,
      onNodeDataChange: (key: string, value: any) => {
        setLocalNode((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            params: {
              ...prev.data.params,
              ...(typeof value === "object" ? value : { [key]: value }),
            },
          },
        }));

        node.data.onChange(key, value);
      },
    };

    return (
      <VStack spacing={4} align="stretch" w="full">
        <PropertiesComponent {...commonProps} />

        {/* 执行按钮和状态显示 */}
        <Box>
          <Button
            colorScheme="blue"
            onClick={handleExecuteNode}
            size="sm"
            width="full"
            isLoading={isExecuting}
            loadingText="执行中..."
            disabled={isExecuting || !localNode.data.workflowId}
          >
            执行节点
          </Button>

          {/* 执行状态显示 */}
          {isExecuting && (
            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <Spinner size="sm" />
              <Text fontSize="sm" color="gray.600">
                正在执行{localNode.data.label}节点...
              </Text>
            </Box>
          )}

          {/* 错误信息显示 */}
          {executionError && (
            <Box mt={2} p={2} bg="red.50" borderRadius="md">
              <Text fontSize="sm" color="red.500">
                执行错误: {executionError}
              </Text>
            </Box>
          )}

          {/* 执行结果显示 */}
          {localNode.data.executionResult &&
            !isExecuting &&
            !executionError && (
              <Box mt={2} p={2} bg="green.50" borderRadius="md">
                <Text fontSize="sm" color="green.600">
                  执行完成
                </Text>
                {localNode.data.executionResult.output_data_ids && (
                  <Text fontSize="xs" color="gray.600" mt={1}>
                    输出数据ID:{" "}
                    {localNode.data.executionResult.output_data_ids.join(", ")}
                  </Text>
                )}
              </Box>
            )}
        </Box>
      </VStack>
    );
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case "image_source":
        // return <ImageSourceView projectId={node.data.projectId} />;
        // ... 其他节点类型的处理
        return null;
      default:
        return null;
    }
  };

  return (
    <Box
      position="relative"
      w="full"
      minW="full"
      bg="white"
      borderRadius="lg"
      p={4}
      boxShadow="sm"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="sm" display="flex" alignItems="center" gap={2}>
          {node.data.label}
        </Heading>
        {getNodePropertiesComponent(node)}
        {renderNodeContent()}
      </VStack>
    </Box>
  );
};

export default NodeProperties;
