import React from "react";
import {
  Box,
  Text,
  VStack,
  Heading,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { nodeConfig } from "./nodeConfig";

export const NodePalette: React.FC = () => {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <Box
      width="200px"
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="sm"
      height="full"
    >
      <Heading size="sm" mb={4}>
        节点类型
      </Heading>
      <Divider mb={4} />
      <VStack spacing={3} align="stretch">
        {Object.entries(nodeConfig).map(([type, config]) => (
          <Box
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            p={2}
            borderWidth="1px"
            borderRadius="md"
            cursor="move"
            _hover={{ bg: "gray.50" }}
            display="flex"
            alignItems="center"
            gap={2}
          >
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
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default NodePalette;
