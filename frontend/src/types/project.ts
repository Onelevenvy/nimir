

export enum ProjectTaskType {
  DETECTION = 0,
  CLASSIFICATION = 1,
  INSTANCE_SEGMENTATION = 2,
  SEMANTIC_SEGMENTATION = 3,
  OCR = 4,
  UNSUPERVISED = 5,
  WORKFLOW = 6,
}

type ProjectCategory = {
  id: ProjectTaskType;
  name: string;
  icon: string;
  colorScheme: string;
  backgroundColor: string;
  title: string;
  description: string;
}

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: ProjectTaskType.DETECTION,
    name: "detection",
    icon: "TbBoxModel2",
    colorScheme: "blue",
    backgroundColor: "#36abff",
    title: "目标检测",
    description: "检测和定位图像中的目标",
  },
  {
    id: ProjectTaskType.CLASSIFICATION,
    name: "classification",
    icon: "TbCategory2",
    colorScheme: "green",
    backgroundColor: "#4caf50",
    title: "图像分类",
    description: "将图像分类到不同类别",
  },
  {
    id: ProjectTaskType.INSTANCE_SEGMENTATION,
    name: "instance_segmentation",
    icon: "BiImage",
    colorScheme: "purple",
    backgroundColor: "#9c27b0",
    title: "实例分割",
    description: "分割图像中的独立目标实例",
  },
  {
    id: ProjectTaskType.SEMANTIC_SEGMENTATION,
    name: "semantic_segmentation",
    icon: "MdOutlineSegment",
    colorScheme: "orange",
    backgroundColor: "#ff9800",
    title: "语义分割",
    description: "按类别分割图像区域",
  },
  {
    id: ProjectTaskType.OCR,
    name: "ocr",
    icon: "BsTextareaT",
    colorScheme: "red",
    backgroundColor: "#f44336",
    title: "字符识别",
    description: "识别图像中的文字内容",
  },
  {
    id: ProjectTaskType.UNSUPERVISED,
    name: "unsupervised",
    icon: "AiOutlineCluster",
    colorScheme: "teal",
    backgroundColor: "#009688",
    title: "非监督学习",
    description: "无监督学习任务",
  },
  {
    id: ProjectTaskType.WORKFLOW,
    name: "workflow",
    icon: "SiKashflow",
    colorScheme: "yellow",
    backgroundColor: "#ffc107",
    title: "工作流",
    description: "组合算法流水线",
  },
] as const; 