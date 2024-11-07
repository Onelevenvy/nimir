import React, { useState, useCallback } from "react";
import { Box, HStack } from "@chakra-ui/react";
import { FlowEditor } from "./FlowEditor";
import { CustomNode } from "./nodeConfig";
import { useRouter, useSearchParams } from "next/navigation";
import { useWorkflow } from "@/hooks/useWorkflow";

interface WorkflowConfigProps {
  projectId: number;
  onNodeSelect?: (node: CustomNode | null) => void;
}

const TQXWorkflowConfig: React.FC<WorkflowConfigProps> = ({
  projectId,
  onNodeSelect,
}) => {
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { workflows, isLoading } = useWorkflow(projectId);

  // 处理节点选择
  const handleNodeSelect = (node: CustomNode | null) => {
    setSelectedNode(node);
    onNodeSelect?.(node);

    if (node?.type) {
      const currentProjectId = searchParams.get("projectId");
      router.replace(`/workflow?projectId=${currentProjectId}&nodeType=${node.type}`);
    }
  };

  // 处理工作流保存
  const handleWorkflowSave = useCallback(() => {
    // 可以在这里添加保存后的额外处理
    console.log("Workflow saved");
  }, []);

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box h="full" bg="white" borderBottom="1px" borderColor="gray.200">
      <HStack h="full" spacing={0}>
        <FlowEditor
          projectId={projectId}
          onNodeSelect={handleNodeSelect}
          onSave={handleWorkflowSave}
          key="flow-editor"
        />
      </HStack>
    </Box>
  );
};

export default TQXWorkflowConfig;
