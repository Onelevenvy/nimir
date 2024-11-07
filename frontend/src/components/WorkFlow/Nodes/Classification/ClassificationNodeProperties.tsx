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

interface ClassificationNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const ClassificationNodeProperties: React.FC<ClassificationNodePropertiesProps> = ({
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
          <option value="resnet50">ResNet50</option>
          <option value="vgg16">VGG16</option>
          <option value="mobilenet">MobileNet</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Top-K</FormLabel>
        <NumberInput
          value={params.topK}
          min={1}
          max={10}
          onChange={(valueString) => {
            const value = parseInt(valueString);
            onNodeDataChange("params", { ...params, topK: value });
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