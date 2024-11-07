import React from "react";
import { Box, VStack, Text, IconButton, HStack } from "@chakra-ui/react";
import { nodeConfig } from "./nodeConfig";

interface NodeMenuProps {
  onNodeSelect: (nodeType: string, tool?: any) => void;
  isDraggable?: boolean;
}

export const NodeMenu: React.FC<NodeMenuProps> = ({
  onNodeSelect,
  isDraggable = true,
}) => {
  const handleNodeInteraction =
    (nodeType: string) => (event: React.MouseEvent | React.DragEvent) => {
      if (isDraggable && event.type === "dragstart") {
        const dragEvent = event as React.DragEvent;
        dragEvent.dataTransfer.setData("application/reactflow", nodeType);
        dragEvent.dataTransfer.effectAllowed = "move";
      } else if (!isDraggable) {
        onNodeSelect(nodeType);
      }
    };

  return (
    <VStack spacing={2} align="stretch">
      {Object.entries(nodeConfig)
        .filter(([type]) => type !== "image_source" && type !== "preprocess")
        .map(([type, config]) => (
          <Box
            key={type}
            p={2}
            borderRadius="md"
            borderWidth="1px"
            cursor={isDraggable ? "move" : "pointer"}
            draggable={isDraggable}
            onClick={!isDraggable ? handleNodeInteraction(type) : undefined}
            onDragStart={isDraggable ? handleNodeInteraction(type) : undefined}
            _hover={{ bg: "gray.50" }}
            bg="white"
          >
            <HStack spacing={3}>
              <IconButton
                aria-label={config.display}
                icon={<config.icon />}
                size="sm"
                colorScheme={config.colorScheme}
                variant="ghost"
              />
              <VStack spacing={0} align="start">
                <Text fontSize="sm" fontWeight="medium">
                  {config.display}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {config.description}
                </Text>
              </VStack>
            </HStack>
          </Box>
        ))}
    </VStack>
  );
};

export default NodeMenu;
