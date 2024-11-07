import { IconType } from "react-icons";
import { ToolType } from "./ToolType";

export interface Tool {
  id: ToolType | string;
  icon: IconType;
  label: string;
  shortcut?: string;
}