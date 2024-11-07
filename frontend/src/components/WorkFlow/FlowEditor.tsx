import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Connection,

  useNodesState,
  useEdgesState,

  Node,
  Panel,
  ConnectionLineType,
  MarkerType,
  ReactFlowProvider,
  Controls,
} from "reactflow";
import { Box, Button, useToast } from "@chakra-ui/react";
import { WorkflowsService } from "@/client";
import { CustomNode, NodeData, NodeType, nodeConfig } from "./nodeConfig";
import { nodeTypes } from "./Nodes";
import "reactflow/dist/style.css";

interface FlowEditorProps {
  projectId: number;
  initialWorkflowId?: number;
  onSave?: () => void;
  onNodeSelect?: (node: CustomNode | null) => void;
}

// 将常量移到组件外部
const SNAP_GRID: [number, number] = [20, 20];
const DEFAULT_POSITION = { x: 100, y: 50 };
const NODE_WIDTH = 150;
const NODE_GAP = 50;
const FIXED_Y = 15;
const INITIAL_X = 50;

const DEFAULT_WORKFLOW_CONFIG = {
  nodes: [
    {
      id: "image_source-1",
      type: "image_source",
      name: "图像源",
      params: {},
    },
    {
      id: "preprocess-1",
      type: "preprocess",
      name: "预处理",
      params: {
        resize: [416, 416],
      },
    },
  ],
  edges: [
    {
      source: "image_source-1",
      target: "preprocess-1",
    },
  ],
};

export const FlowEditor: React.FC<FlowEditorProps> = ({
  projectId,
  initialWorkflowId,
  onSave,
  onNodeSelect,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [currentWorkflowId, setCurrentWorkflowId] = useState<
    number | undefined
  >(initialWorkflowId);
  const toast = useToast();

  const onNodeDataChange = useCallback(
    (nodeId: string, key: string, value: any) => {
      console.log("FlowEditor onNodeDataChange:", {
        nodeId,
        key,
        value,
        currentNodes: nodes,
      });

      if (key === "addNode") {
        const { node, edge } = value;
        setNodes((nds) => [...nds, node]);
        setEdges((eds) => [...eds, edge]);
      } else if (key === "deleteNode") {
        setNodes((currentNodes) => {
          const nodeToDelete = value.nodeId;
          const nodeToDeleteObj = currentNodes.find(node => node.id === nodeToDelete);
          
          if (!nodeToDeleteObj) {
            console.log("Node not found, current nodes:", currentNodes);
            return currentNodes;
          }

          // 不允许删除图像源和预处理节点
          if (nodeToDeleteObj.type === "image_source" || nodeToDeleteObj.type === "preprocess") {
            toast({
              title: "无法删除",
              description: "图像源和预处理节点不能被删除",
              status: "warning",
            });
            return currentNodes;
          }

          // 删除节点
          return currentNodes.filter((node) => node.id !== nodeToDelete);
        });

        // 同样使用回调形式更新边
        setEdges((currentEdges) => 
          currentEdges.filter(
            (edge) => edge.source !== value.nodeId && edge.target !== value.nodeId
          )
        );
      } else {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === nodeId) {
              return {
                ...node,
                data: {
                  ...node.data,
                  params: {
                    ...node.data.params,
                    ...(typeof value === "object" ? value : { [key]: value }),
                  },
                },
              };
            }
            return node;
          })
        );
      }
    },
    [setNodes, setEdges, toast]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, clickedNode: Node) => {
      event.stopPropagation();

      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          selected: node.id === clickedNode.id,
        }))
      );

      if (onNodeSelect) {
        const selectedNode = nodes.find((n) => n.id === clickedNode.id);
        if (selectedNode) {
          onNodeSelect(selectedNode as CustomNode);
        }
      }
    },
    [nodes, onNodeSelect, setNodes]
  );

  const onPaneClick = useCallback(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: false,
      }))
    );
    if (onNodeSelect) {
      onNodeSelect(null as any);
    }
  }, [setNodes, onNodeSelect]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      if (!sourceNode || !targetNode) return;

      if (targetNode.type === "image_source") {
        toast({
          title: "无效连接",
          description: "图像源节点不能作为目标节点",
          status: "error",
        });
        return;
      }

      const existingConnection = edges.find(
        (edge) =>
          edge.source === connection.source && edge.target === connection.target
      );
      if (existingConnection) {
        toast({
          title: "无效连接",
          description: "节点之间已经存在连接",
          status: "error",
        });
        return;
      }

      const targetInputCount = edges.filter(
        (edge) => edge.target === connection.target
      ).length;
      if (targetInputCount > 0) {
        toast({
          title: "无效连接",
          description: "节点只能接收一个输入连接",
          status: "error",
        });
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "default",
            animated: false,
            style: {
              strokeWidth: 2,
              stroke: "#3182CE",
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: "#3182CE",
            },
          },
          eds
        )
      );
    },
    [nodes, edges, setEdges, toast]
  );

  // 加载工作流配置
  const loadWorkflowConfig = useCallback(async () => {
    try {
      const workflow = await WorkflowsService.getProjectWorkflow({ projectId });
      const config = workflow?.config || DEFAULT_WORKFLOW_CONFIG;

      if (workflow) {
        setCurrentWorkflowId(workflow.workflow_id);
      }

      const newNodes = config.nodes.map((node: any, index: number) => {
        const type = node.type as NodeType;
        const configForType = nodeConfig[type];

        return {
          id: node.id,
          type: node.type,
          position: {
            x: INITIAL_X + (NODE_WIDTH + NODE_GAP) * index,
            y: FIXED_Y,
          },
          data: {
            label: configForType.display,
            projectId,
            workflowId: workflow?.workflow_id,
            params: node.params,
            onChange: (key: string, value: any) =>
              onNodeDataChange(node.id, key, value),
          },
        } as CustomNode;
      });

      const newEdges = config.edges.map((edge: any) => ({
        id: `e${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: "default",
        animated: false,
        style: {
          strokeWidth: 2,
          stroke: "#3182CE",
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: "#3182CE",
        },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error("Load workflow error:", error);
      toast({
        title: "载工作流失败",
        description: (error as Error).message,
        status: "error",
      });
    }
  }, [projectId, setNodes, setEdges, toast, onNodeDataChange]);

  useEffect(() => {
    if (!currentWorkflowId) {
      loadWorkflowConfig();
    }
  }, []);

  const handleSave = async () => {
    try {
      const workflow = await WorkflowsService.getProjectWorkflow({ projectId });

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

      if (workflow) {
        await WorkflowsService.updateWorkflow({
          workflowId: workflow.workflow_id,
          requestBody: {
            config: workflowConfig,
          },
        });
        setCurrentWorkflowId(workflow.workflow_id);
      } else {
        const response = await WorkflowsService.createWorkflow({
          requestBody: {
            name: `Workflow-${projectId}`,
            project_id: projectId,
            config: workflowConfig,
          },
        });
        setCurrentWorkflowId(response.workflow_id);
      }

      // 保存成功后重新加载配置
      await loadWorkflowConfig();
      
      toast({
        title: "保存成功",
        status: "success",
      });
      onSave?.();
    } catch (error) {
      console.error("Save workflow error:", error);
      toast({
        title: "保存失败",
        description: (error as Error).message,
        status: "error",
      });
    }
  };

  return (
    <Box
      flex={1}
      h="full"
      position="relative"
      sx={{
        ".react-flow__renderer": {
          height: "60px !important",
          overflow: "hidden",
        },
        ".react-flow__zoompane": {
          transform: "scale(0.5) !important",
          transformOrigin: "0 0",
        },
        ".react-flow__controls": {
          display: "none",
        },
        ".react-flow__handle": {
          width: "8px",
          height: "8px",
        },
        ".react-flow__edge-path": {
          strokeWidth: "2px !important",
          stroke: "#3182CE !important",
        },
        ".react-flow__edge-path-selector": {
          strokeWidth: "10px",
        },
        ".react-flow__arrowhead": {
          fill: "#3182CE",
        },
        ".react-flow__viewport": {
          transform: "translate(0, 0) scale(1) !important",
          width: "100%",
          height: "120px",
          backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        },
      }}
    >
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
          minZoom={0.5}
          maxZoom={0.5}
          zoomOnScroll={false}
          zoomOnPinch={false}
          panOnScroll={false}
          panOnDrag={false}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          snapToGrid={true}
          snapGrid={SNAP_GRID}
          connectionLineType={ConnectionLineType.SmoothStep}
          defaultEdgeOptions={{
            type: "default",
            animated: false,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: "#3182CE",
            },
            style: {
              strokeWidth: 2,
              stroke: "#3182CE",
            },
          }}
          nodesDraggable={false}
        >
          <Background color="white" />
          <Controls />
          <Panel position="top-right">
            <Button colorScheme="blue" onClick={handleSave}>
              保存工作流
            </Button>
          </Panel>
        </ReactFlow>
      </ReactFlowProvider>
    </Box>
  );
};
