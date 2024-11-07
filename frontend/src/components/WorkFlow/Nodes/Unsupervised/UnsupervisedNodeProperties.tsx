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

interface UnsupervisedNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const UnsupervisedNodeProperties: React.FC<UnsupervisedNodePropertiesProps> = ({
  node,
  onNodeDataChange
}) => {
  const { params } = node.data;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>算法</FormLabel>
        <Select
          value={params.algorithm}
          onChange={(e) => onNodeDataChange("params", { ...params, algorithm: e.target.value })}
        >
          <option value="kmeans">K-Means</option>
          <option value="dbscan">DBSCAN</option>
          <option value="hierarchical">层次聚类</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>聚类数量</FormLabel>
        <NumberInput
          value={params.clusters}
          min={2}
          max={20}
          onChange={(valueString) => {
            const value = parseInt(valueString);
            onNodeDataChange("params", { ...params, clusters: value });
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