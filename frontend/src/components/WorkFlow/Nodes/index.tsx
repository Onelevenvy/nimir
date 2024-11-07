import type { ComponentType } from "react";
import type { NodeProps } from "reactflow";
import { ImageSourceNode } from "./ImageSource/ImageSourceNode";
import { PreprocessNode } from "./Preprocess/PreprocessNode";
import { ObjectDetectionNode } from "./ObjectDetection/ObjectDetectionNode";
import { ClassificationNode } from "./Classification/ClassificationNode";
import { InstanceSegmentationNode } from "./InstanceSegmentation/InstanceSegmentationNode";
import { SemanticSegmentationNode } from "./SemanticSegmentation/SemanticSegmentationNode";
import { OcrNode } from "./Ocr/OcrNode";
import { UnsupervisedNode } from "./Unsupervised/UnsupervisedNode";
import { NodeType, nodeConfig, NodeData } from "../nodeConfig";

// 定义节点组件映射
const nodeComponents: Record<NodeType, ComponentType<NodeProps<NodeData>>> = {
  image_source: ImageSourceNode,
  preprocess: PreprocessNode,
  object_detection: ObjectDetectionNode,
  classification: ClassificationNode,
  instance_segmentation: InstanceSegmentationNode,
  semantic_segmentation: SemanticSegmentationNode,
  ocr: OcrNode,
  unsupervised: UnsupervisedNode,
};

// 创建节点类型映射
export const nodeTypes = Object.fromEntries(
  Object.keys(nodeConfig).map((key) => [key, nodeComponents[key as NodeType]])
) as Record<NodeType, ComponentType<NodeProps<NodeData>>>;
