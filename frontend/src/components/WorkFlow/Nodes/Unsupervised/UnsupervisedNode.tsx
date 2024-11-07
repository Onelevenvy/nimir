import React from "react";
import { BaseNode } from "../Base/BaseNode";
import { NodeProps } from "reactflow";
import { NodeData, nodeConfig } from "../../nodeConfig";

export const UnsupervisedNode: React.FC<NodeProps<NodeData>> = (props) => {
  const config = nodeConfig.unsupervised;
  return (
    <BaseNode
      {...props}
      icon={<config.icon />}
      colorScheme={config.colorScheme}
    />
  );
}; 