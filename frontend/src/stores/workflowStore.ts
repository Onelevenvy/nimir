import { create } from "zustand";
import { CustomNode, NodeType } from "@/components/WorkFlow/nodeConfig";

import { persist } from 'zustand/middleware';

interface WorkflowState {
  selectedNode: (CustomNode & { type: NodeType }) | null;
  nodesData: Record<string, any>;
  setSelectedNode: (node: (CustomNode & { type: NodeType }) | null) => void;
  setNodeData: (nodeId: string, data: any) => void;
  getNodeData: (nodeId: string) => any;
  clearNodeData: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      selectedNode: null,
      nodesData: {},
      setSelectedNode: (node) => set({ selectedNode: node }),
      setNodeData: (nodeId, data) => 
        set((state) => ({
          nodesData: {
            ...state.nodesData,
            [nodeId]: data,
          },
        })),
      getNodeData: (nodeId) => get().nodesData[nodeId],
      clearNodeData: () => set({ nodesData: {} }),
    }),
    {
      name: 'workflow-storage',
    }
  )
);
