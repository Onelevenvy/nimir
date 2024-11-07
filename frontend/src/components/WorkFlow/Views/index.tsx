import { Tool } from "../../../types/Tool";
import { ToolType } from "../../../types/ToolType";
import { ProjectImage } from "../../../types/Image";
import { Label } from "../../../types/Label";
import { Annotation } from "../../../types/Annotation";
import {
  FaDrawPolygon,
  FaRegSquare,
  FaArrowsAlt,
  FaEdit,
  FaPaintBrush,
  FaEraser,
  FaUpload,
} from "react-icons/fa";
import ImageSourceView from "@/components/WorkFlow/Views/ImageSourceView";
import PreprocessView from "@/components/WorkFlow/Views/PreprocessView";
import { CustomNode, NodeType } from "@/components/WorkFlow/nodeConfig";
import ObjectDetectionView from "./ObjectDetectionView";
import ClassificationView from "./ClassificationView";

export interface WorkflowViewProps {
  projectId: number;
  selectedImage: ProjectImage | null;
  onImageSelect: (image: ProjectImage) => void;
  node: CustomNode;
  selectedLabel?: Label | null;
  onLabelSelect?: (label: Label | null) => void;
  annotations?: Annotation[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationModify?: (annotation: Annotation) => void;
  canvasRef?: any;
  selectedTool?: ToolType;
  labels?: Label[];
  onLabelEdit?: (label: Label) => void;
  onAddLabel?: () => void;
  onAnnotationDelete?: (index: number) => void;
  onImagesLoad?: (images: ProjectImage[]) => void;
}

// 添加 Tab 配置接口
interface TabConfig {
  id: string;
  title: string;
  disabled?: boolean;
}

export interface WorkflowViewConfig {
  component: React.ComponentType<WorkflowViewProps>;
  tools: Tool[];
  showNodeProperties: boolean;
  showLabelList: boolean;
  showSaveButton: boolean;
  tabs: TabConfig[];
}

export const workflowViews: Record<NodeType, WorkflowViewConfig> = {
  image_source: {
    component: ImageSourceView as React.ComponentType<WorkflowViewProps>,
    tools: [{ id: "upload", icon: FaUpload, label: "上传图片" }] as const,
    showNodeProperties: true,
    showLabelList: false,
    showSaveButton: false,
    tabs: [{ id: "properties", title: "数据属性" }],
  },
  preprocess: {
    component: PreprocessView,
    tools: [] as const,
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: false,
    tabs: [{ id: "properties", title: "预处理参数" }],
  },
  object_detection: {
    component: ObjectDetectionView,
    tools: [
      { id: "rectangle", icon: FaRegSquare, label: "矩形框", shortcut: "R" },
      { id: "move", icon: FaArrowsAlt, label: "移动", shortcut: "M" },
      { id: "edit", icon: FaEdit, label: "编辑", shortcut: "E" },
    ] as const,
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
  classification: {
    component: ClassificationView,
    tools: [
      { id: "rectangle", icon: FaRegSquare, label: "矩形框", shortcut: "R" },
      { id: "move", icon: FaArrowsAlt, label: "移动", shortcut: "M" },
      { id: "edit", icon: FaEdit, label: "编辑", shortcut: "E" },
    ],
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
  instance_segmentation: {
    component: PreprocessView,
    tools: [
      { id: "polygon", icon: FaDrawPolygon, label: "多边形", shortcut: "Q" },
      { id: "rectangle", icon: FaRegSquare, label: "矩形框", shortcut: "R" },
      { id: "brush", icon: FaPaintBrush, label: "画笔" },
      { id: "rubber", icon: FaEraser, label: "橡皮擦" },
      { id: "move", icon: FaArrowsAlt, label: "移动", shortcut: "M" },
      { id: "edit", icon: FaEdit, label: "编辑", shortcut: "E" },
    ],
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
  semantic_segmentation: {
    component: PreprocessView,
    tools: [
      { id: "polygon", icon: FaDrawPolygon, label: "多边形", shortcut: "Q" },
      { id: "rectangle", icon: FaRegSquare, label: "矩形框", shortcut: "R" },
      { id: "brush", icon: FaPaintBrush, label: "画笔" },
      { id: "rubber", icon: FaEraser, label: "橡皮擦" },
      { id: "move", icon: FaArrowsAlt, label: "移动", shortcut: "M" },
      { id: "edit", icon: FaEdit, label: "编辑", shortcut: "E" },
    ],
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
  ocr: {
    component: PreprocessView,
    tools: [],
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
  unsupervised: {
    component: PreprocessView,
    tools: [],
    showNodeProperties: true,
    showLabelList: true,
    showSaveButton: true,
    tabs: [
      { id: "annotation", title: "标注管理" },
      { id: "properties", title: "模型推理" },
      { id: "preview", title: "模型训练" },
    ],
  },
} as const;
