"use client";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  useToast,
  Progress,
  Box,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFileUpload } from "@/hooks/useFileUpload";

interface ImportDataProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ImportData: React.FC<ImportDataProps> = ({
  projectId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploading, uploadFiles } = useFileUpload();

  const handleDirectorySelect = useCallback(async () => {
    try {
      const dirHandle = (await (window as any).showDirectoryPicker({
        mode: "read",
      })) as FileSystemDirectoryHandle;

      const files: File[] = [];

      const processEntry = async (entry: FileSystemDirectoryHandle) => {
        for await (const [name, handle] of entry.entries()) {
          if (handle.kind === "file") {
            const fileHandle = handle as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            if (
              file.type.startsWith("image/") ||
              file.name.toLowerCase().endsWith(".jpg") ||
              file.name.toLowerCase().endsWith(".jpeg") ||
              file.name.toLowerCase().endsWith(".png") ||
              file.name.toLowerCase().endsWith(".bmp") ||
              file.name.toLowerCase().endsWith(".gif")
            ) {
              files.push(file);
            }
          }
        }
      };

      await processEntry(dirHandle);
      setSelectedFiles(files);

      if (files.length === 0) {
        toast({
          title: "提示",
          description: "未找到图片文件",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      await uploadFiles(projectId, files, {
        onProgress: setProgress,
        onSuccess: () => {
          toast({
            title: "上传成功",
            description: `成功导入 ${files.length} 个文件`,
            status: "success",
            duration: 3000,
          });
          onSuccess?.();
          onClose();
        },
        onError: (error) => {
          toast({
            title: "上传失败",
            description: error,
            status: "error",
            duration: 3000,
          });
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      toast({
        title: "选择目录失败",
        description:
          error instanceof Error ? error.message : "选择目录过程中发生错误",
        status: "error",
        duration: 3000,
      });
    } finally {
      setProgress(0);
      setSelectedFiles([]);
    }
  }, [projectId, onSuccess, onClose, toast, uploadFiles]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>导入图片</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Button
              onClick={handleDirectorySelect}
              colorScheme="blue"
              isLoading={uploading}
              loadingText="正在上传..."
            >
              选择文件夹
            </Button>

            {selectedFiles.length > 0 && (
              <Box>
                <Text mb={2}>已选择 {selectedFiles.length} 个文件</Text>
                <Text fontSize="sm" color="gray.500">
                  总大小: {(selectedFiles.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </Box>
            )}

            {uploading && (
              <Progress
                value={progress}
                size="sm"
                colorScheme="blue"
                hasStripe
                isAnimated
              />
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImportData;
