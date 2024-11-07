export interface LabelmeShape {
  label: string;
  points: number[][];  // 二维数组，每个点是 [x, y]
  group_id: null;
  shape_type: string;  // "polygon" 或 "rectangle"
  flags: Record<string, never>;  // 使用 Record 类型代替空对象
}

export interface LabelmeFormat {
  version: string;
  flags: Record<string, never>;  // 使用 Record 类型代替空对象
  shapes: LabelmeShape[];
  imagePath: string;
  imageData: string | null;  // base64 编码的图像数据，我们可以设为 null
  imageHeight: number;
  imageWidth: number;
}
