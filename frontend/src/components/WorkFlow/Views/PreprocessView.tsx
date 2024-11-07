import React, { useEffect } from "react";
import { Box, Center, Text } from "@chakra-ui/react";
import { useWorkflowStageImages } from "@/hooks/useProjectImages";
import { ImageViewer } from "@/components/Annotation/ImageViewer";
import { WorkflowViewProps } from "./index";

const PreprocessView: React.FC<WorkflowViewProps> = ({
  projectId,
  selectedImage,
  onImagesLoad,
  onImageSelect,
  annotations = [],
  onAnnotationAdd,
  onAnnotationModify,
  canvasRef,
  selectedTool,
  selectedLabel,
  node,
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
        <ImageViewer
          imageUrl={selectedImage.url}
          annotations={annotations}
          onAnnotationAdd={onAnnotationAdd}
          onAnnotationModify={onAnnotationModify}
          canvasRef={canvasRef}
          selectedTool={selectedTool}
          selectedLabel={selectedLabel}
        />
      ) : (
        <Center h="full">
          <Text color="gray.500">请选择一张图片</Text>
        </Center>
      )}
    </Box>
  );
};

export default PreprocessView;
