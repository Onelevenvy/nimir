import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  HStack,
} from "@chakra-ui/react";
import { CustomNode } from "../../nodeConfig";

interface PreprocessNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const PreprocessNodeProperties: React.FC<
  PreprocessNodePropertiesProps
> = ({ node, onNodeDataChange }) => {
  const nodeData = node.data;

  const handleResizeChange = (dimension: "width" | "height", value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    const currentResize = nodeData.params.resize || [0, 0];
    const newResize =
      dimension === "width"
        ? [numValue, currentResize[1]]
        : [currentResize[0], numValue];

    

    onNodeDataChange("params", {
      ...nodeData.params,
      resize: newResize,
    });
  };



  const handleRoiChange = (index: number, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    const currentRoi = nodeData.params.roi || [0, 0, 0, 0];
    const newRoi = [...currentRoi];
    newRoi[index] = numValue;

    onNodeDataChange("params", {
      ...nodeData.params,
      roi: newRoi,
    });
  };

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>Resize</FormLabel>
        <HStack>
          <Input
            placeholder="Width"
            type="number"
            value={nodeData.params.resize?.[0] || ""}
            onChange={(e) => handleResizeChange("width", e.target.value)}
            min={0}
            size="sm"
          />
          <Input
            placeholder="Height"
            type="number"
            value={nodeData.params.resize?.[1] || ""}
            onChange={(e) => handleResizeChange("height", e.target.value)}
            min={0}
            size="sm"
          />
        </HStack>
      </FormControl>

      <FormControl>
        <FormLabel>Region of Interest (ROI)</FormLabel>
        <VStack spacing={2}>
          <HStack>
            <Input
              placeholder="X"
              type="number"
              value={nodeData.params.roi?.[0] || ""}
              onChange={(e) => handleRoiChange(0, e.target.value)}
              size="sm"
            />
            <Input
              placeholder="Y"
              type="number"
              value={nodeData.params.roi?.[1] || ""}
              onChange={(e) => handleRoiChange(1, e.target.value)}
              size="sm"
            />
          </HStack>
          <HStack>
            <Input
              placeholder="Width"
              type="number"
              value={nodeData.params.roi?.[2] || ""}
              onChange={(e) => handleRoiChange(2, e.target.value)}
              min={0}
              size="sm"
            />
            <Input
              placeholder="Height"
              type="number"
              value={nodeData.params.roi?.[3] || ""}
              onChange={(e) => handleRoiChange(3, e.target.value)}
              min={0}
              size="sm"
            />
          </HStack>
        </VStack>
      </FormControl>
    </VStack>
  );
};
