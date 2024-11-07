export interface Annotation {
  id?: number;
  type: "polygon" | "rectangle" | "move" | "brush" | "rubber";
  points: number[];
  color: string;
  labelId: number;
  labelmeData?: string | null;
}
