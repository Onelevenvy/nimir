import React from "react";
import { 
  VStack, 
  FormControl, 
  FormLabel, 
  Select
} from "@chakra-ui/react";
import { CustomNode } from "../../nodeConfig";

interface OcrNodePropertiesProps {
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}

export const OcrNodeProperties: React.FC<OcrNodePropertiesProps> = ({
  node,
  onNodeDataChange
}) => {
  const { params } = node.data;

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
        <FormLabel>语言</FormLabel>
        <Select
          value={params.language}
          onChange={(e) => onNodeDataChange("params", { ...params, language: e.target.value })}
        >
          <option value="chi_sim">中文简体</option>
          <option value="chi_tra">中文繁体</option>
          <option value="eng">英文</option>
          <option value="jpn">日文</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>识别模式</FormLabel>
        <Select
          value={params.mode}
          onChange={(e) => onNodeDataChange("params", { ...params, mode: e.target.value })}
        >
          <option value="accurate">精确模式</option>
          <option value="fast">快速模式</option>
        </Select>
      </FormControl>
    </VStack>
  );
}; 