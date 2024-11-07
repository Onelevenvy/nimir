import React, { useState } from "react";
import {
  Box,
  Text,
  HStack,
  IconButton,
  VStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Portal,
} from "@chakra-ui/react";
import { Handle, Position, NodeProps } from "reactflow";
import { FaPlus, FaMinus } from "react-icons/fa";
import NodeMenu from "../../NodeMenu";
import { nodeConfig, NodeType, NodeData } from "../../nodeConfig";

export interface BaseNodeProps extends NodeProps<NodeData> {
  icon?: React.ReactElement;
  colorScheme?: string;
  onDelete?: () => void;
  children?: React.ReactNode;
}

export const BaseNode: React.FC<BaseNodeProps> = ({
  data,
  selected,
  icon,
  colorScheme = "blue",
  onDelete,
  children,
  id,
  type,
  isConnectable = true,
  ...rest
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isImageSource = type === "image_source";
  const isPreprocess = type === "preprocess";
  const isDefaultNode = isImageSource || isPreprocess;

  // 修改处理添加下一个节点的函数
  const handleAddNextNode = (nodeType: string) => {
    console.log("handleAddNextNode called with:", nodeType);
    if (!data.onChange) {
      console.error("onChange callback is not defined");
      return;
    }

    // 获取当前节点的位置和尺寸
    const currentNode = document.querySelector(`[data-nodeid="${id}"]`);
    if (!currentNode) return;

    const rect = currentNode.getBoundingClientRect();

    const NODE_GAP = 50;

    // 计算新节点的位置（在当前节点右侧）
    const position = {
      x: rect.right + NODE_GAP,
      y: 15, // 使用固定的Y坐标
    };

    // 创建新节点
    const config = nodeConfig[nodeType as NodeType];
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: config.display,
        projectId: data.projectId,
        params: JSON.parse(JSON.stringify(config.initialData.params)),
        onChange: data.onChange,
      },
    };

    // 创建连接边
    const edge = {
      id: `e${id}-${newNode.id}`,
      source: id,
      target: newNode.id,
      type: "default",
      style: {
        strokeWidth: 2,
        stroke: "#3182CE",
      },
      markerEnd: {
        type: "arrowclosed",
        width: 15,
        height: 15,
        color: "#3182CE",
      },
    };

    // 通过 data.onChange 回调通知父组件
    data.onChange("addNode", { node: newNode, edge });
    setIsMenuOpen(false);
  };

  return (
    <div>
      <Box
        padding="5px"
        borderRadius="lg"
        bg="white"
        borderWidth={selected ? "2px" : "1px"}
        borderColor={selected ? `${colorScheme}.500` : "gray.200"}
        width="150px"
        height="40px"
        position="relative"
        boxShadow={selected ? "lg" : "sm"}
        data-nodeid={id}
        transition="all 0.2s"
        _hover={{
          borderColor: `${colorScheme}.400`,
          boxShadow: "md",
        }}
        {...rest}
      >
        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: "#555",
            width: "8px",
            height: "8px",
          }}
          id="input"
          isConnectable={isConnectable}
        />

        <HStack spacing={2} justify="space-between" h="full" px={2}>
          <HStack flex={1}>
            {icon && (
              <IconButton
                aria-label={data.label}
                icon={icon}
                size="xs"
                colorScheme={colorScheme}
                variant="ghost"
              />
            )}
            <Text fontWeight="bold" fontSize="sm" isTruncated>
              {data.label}
            </Text>
          </HStack>

          {!isImageSource && (
            <VStack spacing={0} align="center">
              <Popover
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                placement="right"
                closeOnBlur={true}
              >
                <PopoverTrigger>
                  <IconButton
                    aria-label="Add next node"
                    icon={<FaPlus />}
                    size="xs"
                    colorScheme="green"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMenuOpen(!isMenuOpen);
                    }}
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent width="250px">
                    <NodeMenu
                      onNodeSelect={(nodeType) => {
                        handleAddNextNode(nodeType);
                        setIsMenuOpen(false);
                      }}
                      isDraggable={false}
                    />
                  </PopoverContent>
                </Portal>
              </Popover>

              {!isImageSource && !isPreprocess && (
                <IconButton
                  aria-label="Delete node"
                  icon={<FaMinus />}
                  size="xs"
                  colorScheme="red"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (data.onChange) {
                      data.onChange("deleteNode", { nodeId: id });
                    }
                  }}
                />
              )}
            </VStack>
          )}
        </HStack>

        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: "#555",
            width: "8px",
            height: "8px",
          }}
          id="output"
          isConnectable={isConnectable}
        />
      </Box>
    </div>
  );
};
