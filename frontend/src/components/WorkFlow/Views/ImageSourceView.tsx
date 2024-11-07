import React, { useEffect } from "react";
import { Box, Center, Text } from "@chakra-ui/react";
import {
  // useOriginalImages,
  useWorkflowStageImages,
} from "@/hooks/useProjectImages";
import { ImageViewer } from "@/components/Annotation/ImageViewer";
import { WorkflowViewProps } from "./index";

const ImageSourceView: React.FC<WorkflowViewProps> = ({
  projectId,
  selectedImage,
  onImagesLoad,
  annotations = [],
  onAnnotationAdd,
  onAnnotationModify,
  canvasRef,
  selectedTool,
  selectedLabel,
  node,
  onImageSelect,
  onLabelSelect,
  labels = [],
  onLabelEdit,
  onAddLabel,
  onAnnotationDelete,
}) => {
  const { data: originalImages, isLoading } = useWorkflowStageImages(
    projectId,
    "original"
  );

  // 当获取到原始图片时，更新父组件的图片列表
  useEffect(() => {
    if (originalImages && onImagesLoad) {
      onImagesLoad(originalImages);
    }
  }, [originalImages, onImagesLoad]);

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

export default ImageSourceView;
