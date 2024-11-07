"use client";

// import TQXCanvas from "@/components/LabelCanvas";
import { Annotation } from "@/types/Annotation";
import { ToolType } from "@/types/ToolType";
import { Label } from "@/types/Label";
import {
  Flex,
  useDisclosure,
  useToast,
  Box,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  FaRegSquare,
  FaDrawPolygon,
  FaPaintBrush,
  FaArrowsAlt,
  FaEraser,
  FaEdit,
} from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { ApiError, LabelsService, AnnotationsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";
import { useQueryClient } from "react-query";
import { ProjectImage } from "@/types/Image";
import { useWorkflowStageImages } from "@/hooks/useProjectImages";
import { Tool } from "@/types/Tool";
import { useAnnotations } from "@/hooks/useAnnotations";
import { useAnnotationShortcuts } from "@/hooks/useAnnotationShortcuts";
import { ToolBar } from "@/components/Annotation/ToolBar";
import { ImageList } from "@/components/Annotation/ImageList";
import { LabelList } from "@/components/Annotation/LabelList";
import LabelModal from "@/components/LabelModal";
import ImportData from "@/components/Projects/ImportData";
import { useLabels } from "@/hooks/useLabels";
import TQXWorkflowConfig from "@/components/WorkFlow";
import { CustomNode, NodeType } from "@/components/WorkFlow/nodeConfig";
import NodeProperties from "@/components/WorkFlow/NodeProperties";
import { workflowViews } from "@/components/WorkFlow/Views";
import { AnnotationList } from "@/components/Annotation/AnnotationList";

interface CanvasRef {
  exportToLabelme: () => any;
}

export default function WorkflowPage() {
  const tools: Tool[] = [
    { id: "polygon", icon: FaDrawPolygon, label: "多边形", shortcut: "Q" },
    { id: "rectangle", icon: FaRegSquare, label: "矩形框", shortcut: "R" },
    { id: "brush", icon: FaPaintBrush, label: "画笔" },
    { id: "rubber", icon: FaEraser, label: "橡皮擦" },
    { id: "move", icon: FaArrowsAlt, label: "移动", shortcut: "M" },
    { id: "edit", icon: FaEdit, label: "编辑", shortcut: "E" },
  ];

  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>("polygon");
  const [selectedLabel, setSelectedLabel] = useState<Label | null>(null);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const showToast = useCustomToast();
  const router = useRouter();
  const canvasRef = useRef<CanvasRef>(null);
  // 添加这些状态声明
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  //   const nodeType = searchParams.get("nodeType");

  // 存储选中的节点
  const [selectedWorkflowNode, setSelectedWorkflowNode] =
    useState<CustomNode | null>(null);

  const {
    annotations,
    setAnnotations,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveAnnotations,
    handleAnnotationDelete: deleteAnnotation,
  } = useAnnotations(projectId || "", selectedImage);
  const [currentImages, setCurrentImages] = useState<ProjectImage[]>([]);
  const { data: images = [], isLoading: isLoadingImages } =
    useWorkflowStageImages(Number(projectId), "original");

  const { data: labels = [] } = useLabels(projectId || "");

  // 添加参数检查
  useEffect(() => {
    if (!projectId) {
      showToast("Error", "Project ID is required", "error");
      router.push("/project");
      return;
    }
  }, [projectId, router, showToast]);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // 添加类型保护
  const isValidNodeType = (type: string | null): type is NodeType => {
    return type !== null && type in workflowViews;
  };

  // 根据节点类型获取对应的视图配置
  const viewConfig =
    selectedWorkflowNode?.type && isValidNodeType(selectedWorkflowNode.type)
      ? workflowViews[selectedWorkflowNode.type]
      : null;

  // 修改工具栏处理数
  const handleToolSelect = (tool: string) => {
    if (tool === "upload") {
      setIsImportModalOpen(true);
    } else {
      setSelectedTool(tool as ToolType);
    }
  };

  // 修改 ImportData 组件的 onSuccess 回调
  const handleImportSuccess = () => {
    if (projectId) {
      queryClient.invalidateQueries(["project-images", projectId]);
      setIsImportModalOpen(false);
      showToast("Success", "Images imported successfully", "success");
    }
  };

  // 图片切换函数
  const switchImage = useCallback(
    async (direction: "prev" | "next") => {
      if (!selectedImage || !currentImages.length) return;

      try {
        if (hasUnsavedChanges) {
          await saveAnnotations(canvasRef);
        }

        const currentIndex = currentImages.findIndex(
          (img: ProjectImage) => img.id === selectedImage.id
        );
        let newImage;
        if (direction === "prev") {
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : currentImages.length - 1;
          newImage = currentImages[prevIndex];
        } else {
          const nextIndex =
            currentIndex < currentImages.length - 1 ? currentIndex + 1 : 0;
          newImage = currentImages[nextIndex];
        }

        setAnnotations([]);
        setSelectedImage(newImage);
        setHasUnsavedChanges(false);
      } catch (error) {
        showToast("Error", "Failed to switch image", "error");
      }
    },
    [
      selectedImage,
      currentImages,
      hasUnsavedChanges,
      saveAnnotations,
      canvasRef,
      setAnnotations,
      showToast,
      setHasUnsavedChanges,
    ]
  );

  // 使用快捷键 hook
  useAnnotationShortcuts(setSelectedTool, switchImage, () => {
    if (hasUnsavedChanges) {
      saveAnnotations(canvasRef);
    }
  });

  const handleImageClick = useCallback(
    async (image: ProjectImage) => {
      try {
        if (hasUnsavedChanges && selectedImage) {
          await saveAnnotations(canvasRef);
        }
        setAnnotations([]);
        setSelectedImage(image);
        setHasUnsavedChanges(false);
      } catch (error) {
        showToast("Error", "Failed to switch image", "error");
      }
    },
    [
      hasUnsavedChanges,
      selectedImage,
      saveAnnotations,
      canvasRef,
      setAnnotations,
      showToast,
      setHasUnsavedChanges,
    ]
  );

  const handleLabelAdd = async (label: Label) => {
    try {
      await LabelsService.createLabel({
        requestBody: {
          project_id: Number(projectId),
          name: label.name,
          color: label.color,
        },
      });

      queryClient.invalidateQueries(["labels", projectId]);
      showToast("Success", "Label created successfully", "success");
    } catch (error) {
      showToast("Error", error as Error, "error");
    }
  };

  const handleLabelEdit = (label: Label) => {
    setEditingLabel(label);
    onOpen();
  };

  const handleLabelAddOrEdit = async (label: Label) => {
    if (editingLabel) {
      try {
        await LabelsService.updateLabel({
          labelId: label.id,
          requestBody: {
            name: label.name,
            color: label.color,
          },
        });

        queryClient.invalidateQueries(["labels", projectId]);
        showToast("Success", "Label updated successfully", "success");
      } catch (error) {
        showToast("Error", error as Error, "error");
      }
    } else {
      await handleLabelAdd(label);
    }
    setEditingLabel(null);
    onClose();
  };

  const handleAnnotationAdd = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
    setHasUnsavedChanges(true);
  };

  const handleAnnotationModify = (annotation: Annotation) => {
    setAnnotations(
      annotations.map((a: Annotation) =>
        a.id === annotation.id ? annotation : a
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleAnnotationDelete = async (index: number) => {
    try {
      const annotationToDelete = annotations[index];
      await deleteAnnotation(annotationToDelete, canvasRef);
    } catch (error) {
      const errDetail = (error as ApiError).body?.detail;
      showToast("Error", errDetail || "Failed to delete annotation", "error");
    }
  };

  // 添加加载注的 useEffect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const loadAnnotations = async () => {
      if (!selectedImage) return;

      try {
        const response = await AnnotationsService.readAnnotationsByData({
          dataId: selectedImage.id,
        });

        const loadedAnnotations: Annotation[] = response.map((ann) => {
          if (!ann.points) {
            throw new Error("Annotation points are required");
          }

          return {
            id: ann.annotation_id,
            type: ann.type as
              | "polygon"
              | "rectangle"
              | "move"
              | "brush"
              | "rubber",
            points: ann.points.split(",").map(Number),
            color: ann.color || "#FF0000",
            labelId: ann.label_id,
            labelmeData: ann.labelme_data || null,
          };
        });

        setAnnotations(loadedAnnotations);
        setHasUnsavedChanges(false);
      } catch (error) {
        showToast("Error", "Failed to load annotations", "error");
        setAnnotations([]);
      }
    };

    loadAnnotations();
  }, [selectedImage, showToast, setAnnotations, setHasUnsavedChanges]);

  // 添加这个 useEffect 来处理自动选择第一张图片
  useEffect(() => {
    if (!isLoadingImages && images.length > 0 && !selectedImage) {
      handleImageClick(images[0]);
    }
  }, [images, isLoadingImages, selectedImage, handleImageClick]);

  // 获取当前视图配置
  const ViewComponent = viewConfig?.component;

  // 修改节点选择处理函数
  const handleWorkflowNodeSelect = useCallback((node: CustomNode | null) => {
    setSelectedWorkflowNode(node);
    // 清空当前选中的图片，这样会触发自动选择第一张图片
    setSelectedImage(null);
  }, []);

  // 修改 NodeProperties 的关闭处理
  const handleNodePropertiesClose = () => {
    setSelectedWorkflowNode(null);
  };

  // 处理图片加载
  const handleImagesLoad = useCallback(
    (images: ProjectImage[]) => {
      setCurrentImages(images);
      // 如果没有选中图片，自动选择第一张
      if (!selectedImage && images.length > 0) {
        handleImageClick(images[0]);
      }
    },
    [selectedImage, handleImageClick]
  );

  // 添加这个 useEffect 来处理节点切换时的图片选择
  useEffect(() => {
    if (selectedWorkflowNode && currentImages.length > 0 && !selectedImage) {
      handleImageClick(currentImages[0]);
    }
  }, [selectedWorkflowNode, currentImages, selectedImage, handleImageClick]);

  return (
    <Flex direction="column" h="100vh" bg="gray.50" overflow="hidden">
      {/* 工作流配置区域 */}
      <Box
        h="10%"
        minH="10%"
        maxH="10%"
        borderBottom="1px"
        borderColor="gray.200"
        bg="white"
      >
        <TQXWorkflowConfig
          projectId={Number(projectId)}
          onNodeSelect={handleWorkflowNodeSelect}
        />
      </Box>

      {/* 标注区域 */}
      <Box h="90%" minH="90%" maxH="90%">
        <Flex h="full" maxH="full" gap={2} p={2}>
          {/* 工具栏 - 固定宽度 */}
          <Box w="3%" minW="3%" maxW="3%">
            <ToolBar
              tools={viewConfig?.tools || tools}
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
              onSave={() => saveAnnotations(canvasRef)}
              onImport={() => setIsImportModalOpen(true)}
              onBack={() => router.push("/project")}
              hasUnsavedChanges={hasUnsavedChanges}
              showSaveButton={viewConfig?.showSaveButton ?? true}
            />
          </Box>

          {/* 图片列表 - 固定宽度 */}
          <Box
            w="7%"
            minW="7%"
            maxW="7%"
            bg="white"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
          >
            <ImageList
              images={currentImages}
              selectedImage={selectedImage}
              isLoading={false}
              onImageSelect={handleImageClick}
            />
          </Box>

          {/* 主视图区域 - 自适应宽度 */}
          <Box
            flex={1}
            minW="0"
            bg="white"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
          >
            {selectedWorkflowNode && ViewComponent && (
              <ViewComponent
                projectId={Number(projectId)}
                selectedImage={selectedImage}
                onImageSelect={handleImageClick}
                selectedLabel={selectedLabel}
                onLabelSelect={setSelectedLabel}
                annotations={annotations}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationModify={handleAnnotationModify}
                canvasRef={canvasRef}
                selectedTool={selectedTool}
                labels={labels}
                onLabelEdit={handleLabelEdit}
                onAddLabel={onOpen}
                onAnnotationDelete={handleAnnotationDelete}
                node={selectedWorkflowNode}
                onImagesLoad={handleImagesLoad}
              />
            )}
          </Box>

          {/* 右侧面板 - 固定宽度 */}
          <Box
            w="15%"
            minW="15%"
            maxW="15%"
            bg="white"
            borderRadius="md"
            overflow="hidden"
            boxShadow="sm"
          >
            <Tabs
              variant="unstyled"
              w="full"
              h="full"
              display="flex"
              flexDirection="row"
              orientation="vertical"
            >
              <Box
                flex="1"
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                overflow="hidden"
              >
                <TabPanels flex="1" overflow="hidden" h="full">
                  {viewConfig?.tabs.map((tab, index) => (
                    <TabPanel key={tab.id} h="full" p={0}>
                      {tab.id === "annotation" && viewConfig.showLabelList ? (
                        <VStack h="full" w="full" spacing={0} p={0}>
                          <Box w="full" h="40%" bg="white">
                            <LabelList
                              labels={labels}
                              selectedLabel={selectedLabel}
                              onLabelSelect={setSelectedLabel}
                              onLabelEdit={handleLabelEdit}
                              onAddLabel={onOpen}
                            />
                          </Box>
                          <Box w="full" h="60%" bg="white">
                            <AnnotationList
                              annotations={annotations}
                              labels={labels}
                              onDelete={handleAnnotationDelete}
                            />
                          </Box>
                        </VStack>
                      ) : tab.id === "properties" && selectedWorkflowNode ? (
                        <Box w="full" h="full" bg="white" overflow="auto">
                          <NodeProperties node={selectedWorkflowNode} />
                        </Box>
                      ) : (
                        <Box w="full" h="full" bg="white">
                          {/* 其他 tab 内容可以根据 tab.id 来渲染不同的组件 */}
                        </Box>
                      )}
                    </TabPanel>
                  ))}
                </TabPanels>
              </Box>

              <Box w="20px" bg="white" borderRadius="md" boxShadow="sm" ml={2}>
                <TabList flexDirection="column" w="full" h="full" p={0}>
                  {viewConfig?.tabs.map((tab, index) => (
                    <Tab
                      key={tab.id}
                      h={`${100 / viewConfig.tabs.length}%`}
                      w="full"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      p={0}
                      borderRadius="md"
                      _selected={{
                        bg: "blue.500",
                        color: "white",
                      }}
                      _hover={{
                        bg: "blue.200",
                      }}
                      isDisabled={tab.disabled}
                    >
                      <Text
                        sx={{
                          writingMode: "vertical-rl",
                          textOrientation: "upright",
                          letterSpacing: "0.1em",
                          fontSize: "12px",
                        }}
                      >
                        {tab.title}
                      </Text>
                    </Tab>
                  ))}
                </TabList>
              </Box>
            </Tabs>
          </Box>
        </Flex>
      </Box>

      <LabelModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setEditingLabel(null);
        }}
        onAdd={handleLabelAddOrEdit}
        label={editingLabel || undefined}
      />

      <ImportData
        projectId={projectId ? Number(projectId) : 0}
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </Flex>
  );
}
