export interface ProjectImage {
  id: number;
  url: string;
  name: string;
  type: "original" | "processed";
  metadata?: any;
  category?: string;
  stage?: string;
  original_data_id?: number;
  workflow_execution_id?: number | null;
  node_execution_id?: number | null;
  processing_stage?: string;
}
