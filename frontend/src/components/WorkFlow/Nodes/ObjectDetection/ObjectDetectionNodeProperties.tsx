import React from "react";
import { VStack, FormControl, FormLabel, Box } from "@chakra-ui/react";
import { CustomNode } from "../../nodeConfig";

interface ObjectDetectionNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const ObjectDetectionNodeProperties: React.FC<
  ObjectDetectionNodePropertiesProps
> = ({ node, onNodeDataChange }) => {
  const nodeData = node.data;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Object Detection</FormLabel>
        <Box>{"TODO"}</Box>
      </FormControl>
    </VStack>
  );
};
