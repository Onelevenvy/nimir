import { Node, NodeProps } from "reactflow";
import {
  FaImage,
  FaCrop,
  FaObjectGroup,
  FaTag,
  FaLayerGroup,
  FaFont,
  FaBrain,
  FaProjectDiagram,
} from "react-icons/fa";

import { ImageSourceNode } from "./Nodes/ImageSource/ImageSourceNode";
import { PreprocessNode } from "./Nodes/Preprocess/PreprocessNode";
import { ObjectDetectionNode } from "./Nodes/ObjectDetection/ObjectDetectionNode";
import { ClassificationNode } from "./Nodes/Classification/ClassificationNode";
import { InstanceSegmentationNode } from "./Nodes/InstanceSegmentation/InstanceSegmentationNode";
import { SemanticSegmentationNode } from "./Nodes/SemanticSegmentation/SemanticSegmentationNode";
import { OcrNode } from "./Nodes/Ocr/OcrNode";
import { UnsupervisedNode } from "./Nodes/Unsupervised/UnsupervisedNode";

import { ImageSourceNodeProperties } from "./Nodes/ImageSource/ImageSourceNodeProperties";
import { PreprocessNodeProperties } from "./Nodes/Preprocess/PreprocessNodeProperties";
import { ObjectDetectionNodeProperties } from "./Nodes/ObjectDetection/ObjectDetectionNodeProperties";
import { ClassificationNodeProperties } from "./Nodes/Classification/ClassificationNodeProperties";
import { InstanceSegmentationNodeProperties } from "./Nodes/InstanceSegmentation/InstanceSegmentationNodeProperties";
import { SemanticSegmentationNodeProperties } from "./Nodes/SemanticSegmentation/SemanticSegmentationNodeProperties";
import { OcrNodeProperties } from "./Nodes/Ocr/OcrNodeProperties";
import { UnsupervisedNodeProperties } from "./Nodes/Unsupervised/UnsupervisedNodeProperties";

// 基础节点数据类型
export interface NodeData {
  label: string;
  projectId: number;
  workflowId?: number;
  params: {
    [key: string]: any;
  };
  onChange: (key: string, value: any) => void;
  description?: string;
  error?: string;
  executionResult?: any;
}

// 自定义节点类型
export type CustomNode = Node<NodeData>;

// 节点组件类型
export type NodeComponent = React.FC<NodeProps<NodeData>>;

// 节点属性组件类型
export type NodePropertiesComponent = React.FC<{
  node: CustomNode;
  onNodeDataChange: (key: string, value: any) => void;
}>;

// 节点配置项接口
interface NodeConfigItem {
  component: NodeComponent;
  properties: NodePropertiesComponent;
  icon: React.ComponentType;
  colorScheme: string;
  display: string;
  description: string;
  initialData: {
    params: {
      [key: string]: any;
    };
  };
  allowedConnections: {
    sources: string[];
    targets: string[];
  };
}

// 节点配置
export const nodeConfig = {
  image_source: {
    component: ImageSourceNode,
    properties: ImageSourceNodeProperties,
    icon: FaImage,
    colorScheme: "blue",
    display: "图像源",
    description: "选择输入图像",
    initialData: {
      params: {
        source_type: "file",
        path: "data/original",
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: [],
    },
  },
  preprocess: {
    component: PreprocessNode,
    properties: PreprocessNodeProperties,
    icon: FaCrop,
    colorScheme: "green",
    display: "预处理",
    description: "图像预处理节点",
    initialData: {
      params: {
        resize: [416, 416],
        path: "data/preprocessed",
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  object_detection: {
    component: ObjectDetectionNode,
    properties: ObjectDetectionNodeProperties,
    icon: FaObjectGroup,
    colorScheme: "blue",
    display: "目标检测",
    description: "检测图像中的目标",
    initialData: {
      params: {
        model: "yolov8",
        confidence: 0.5,
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  classification: {
    component: ClassificationNode,
    properties: ClassificationNodeProperties,
    icon: FaTag,
    colorScheme: "green",
    display: "图像分类",
    description: "对图像进行分类",
    initialData: {
      params: {
        model: "resnet50",
        topK: 5,
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  instance_segmentation: {
    component: InstanceSegmentationNode,
    properties: InstanceSegmentationNodeProperties,
    icon: FaLayerGroup,
    colorScheme: "purple",
    display: "实例分割",
    description: "分割图像中的独立目标实例",
    initialData: {
      params: {
        model: "mask_rcnn",
        confidence: 0.5,
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  semantic_segmentation: {
    component: SemanticSegmentationNode,
    properties: SemanticSegmentationNodeProperties,
    icon: FaProjectDiagram,
    colorScheme: "orange",
    display: "语义分割",
    description: "按类别分割图像区域",
    initialData: {
      params: {
        model: "deeplabv3",
        confidence: 0.5,
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  ocr: {
    component: OcrNode,
    properties: OcrNodeProperties,
    icon: FaFont,
    colorScheme: "red",
    display: "字符识别",
    description: "识别图像中的文字",
    initialData: {
      params: {
        language: "chi_sim",
        mode: "accurate",
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
  unsupervised: {
    component: UnsupervisedNode,
    properties: UnsupervisedNodeProperties,
    icon: FaBrain,
    colorScheme: "teal",
    display: "非监督学习",
    description: "无监督学习任务",
    initialData: {
      params: {
        algorithm: "kmeans",
        clusters: 5,
      },
    },
    allowedConnections: {
      sources: ["output"],
      targets: ["input"],
    },
  },
} as const;

// 节点类型枚举 - 从配置中自动推导
export type NodeType = keyof typeof nodeConfig;
