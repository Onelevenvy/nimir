import React from "react";
import { VStack, FormControl, FormLabel, Box } from "@chakra-ui/react";

import { CustomNode } from "../../nodeConfig";

interface ImageSourceNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const ImageSourceNodeProperties: React.FC<
  ImageSourceNodePropertiesProps
> = ({ node, onNodeDataChange }) => {
  const nodeData = node.data;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>图像源：</FormLabel>
        <Box> {"TODO"}</Box>
      </FormControl>
    </VStack>
  );
};
