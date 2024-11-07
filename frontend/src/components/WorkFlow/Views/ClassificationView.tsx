import React, { useEffect } from "react";
import { Box, Center, Text } from "@chakra-ui/react";
import { useWorkflowStageImages } from "@/hooks/useProjectImages";
import TQXCanvas from "@/components/LabelCanvas";
import { WorkflowViewProps } from "./index";
import { ToolType } from "@/types/ToolType";
import { Label } from "@/types/Label";
import { Annotation } from "@/types/Annotation";

const ClassificationView: React.FC<WorkflowViewProps> = ({
  projectId,
  selectedImage,
  onImagesLoad,
  onImageSelect,
  annotations = [],
  onAnnotationAdd,
  onAnnotationModify,
  onAnnotationDelete,
  canvasRef,
  selectedTool,
  selectedLabel,
  node,
  labels = [],
  onLabelSelect,
  onLabelEdit,
  onAddLabel,
}) => {
  const { data: processedImages, isLoading } = useWorkflowStageImages(
    projectId,
    node.id
  );

  useEffect(() => {
    if (processedImages) {
      onImagesLoad?.(processedImages);
    }
  }, [processedImages, onImagesLoad]);

  if (isLoading) {
    return (
      <Center h="full">
        <Text>加载中...</Text>
      </Center>
    );
  }

  return (
    <Box h="full" position="relative">
      {selectedImage ? (
        <TQXCanvas
          ref={canvasRef}
          imageUrl={selectedImage.url}
          currentTool={selectedTool as ToolType}
          currentColor={selectedLabel?.color || "#FF0000"}
          currentLabel={selectedLabel as Label | null}
          annotations={annotations as Annotation[]}
          onAnnotationAdd={onAnnotationAdd!}
          onAnnotationModify={onAnnotationModify!}
          onError={(message: string) => {
            console.error(message);
          }}
          labels={labels}
        />
      ) : (
        <Center h="full">
          <Text color="gray.500">请选择一张图片</Text>
        </Center>
      )}
    </Box>
  );
};

export default ClassificationView;
