import { Annotation } from "@/types/Annotation";
import { Label } from "@/types/Label";
import { ToolType } from "@/types/ToolType";
import { Box, Image } from "@chakra-ui/react";
import React from "react";

interface ImageViewerProps {
  imageUrl: string;
  annotations?: Annotation[];
  onAnnotationAdd?: (annotation: Annotation) => void;
  onAnnotationModify?: (annotation: Annotation) => void;
  canvasRef?: any;
  selectedTool?: ToolType;
  selectedLabel?: Label | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  // readOnly = false,
}) => {
  return (
    <Box w="full" h="full" position="relative">
      <Image
        src={imageUrl}
        alt="Preview"
        objectFit="contain"
        w="full"
        h="full"
        draggable={false}
      />
    </Box>
  );
};
