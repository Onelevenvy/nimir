import axios from 'axios';
import { useState } from 'react';

interface UploadCallbacks {
  onProgress?: (progress: number) => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (
    projectId: number,
    files: File[],
    callbacks?: UploadCallbacks
  ) => {
    const { onProgress, onSuccess, onError } = callbacks || {};
    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/projects/${projectId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress?.(percentCompleted);
          },
          withCredentials: true,
        }
      );

      onSuccess?.();
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.detail || "文件上传失败";
        onError?.(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = "未知错误";
        onError?.(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  return {
    uploading,
    uploadFiles,
  };
}
