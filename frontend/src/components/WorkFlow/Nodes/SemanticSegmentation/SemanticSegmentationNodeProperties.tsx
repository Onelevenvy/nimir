import React from "react";
import { 
  VStack, 
  FormControl, 
  FormLabel, 
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from "@chakra-ui/react";
import { CustomNode } from "../../nodeConfig";

interface SemanticSegmentationNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const SemanticSegmentationNodeProperties: React.FC<SemanticSegmentationNodePropertiesProps> = ({
  node,
  onNodeDataChange
}) => {
  const { params } = node.data;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>模型</FormLabel>
        <Select
          value={params.model}
          onChange={(e) => onNodeDataChange("params", { ...params, model: e.target.value })}
        >
          <option value="deeplabv3">DeepLabV3</option>
          <option value="pspnet">PSPNet</option>
          <option value="unet">U-Net</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>置信度阈值</FormLabel>
        <NumberInput
          value={params.confidence}
          min={0}
          max={1}
          step={0.1}
          onChange={(valueString) => {
            const value = parseFloat(valueString);
            onNodeDataChange("params", { ...params, confidence: value });
          }}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
    </VStack>
  );
}; 