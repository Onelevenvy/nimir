import { useQuery } from "react-query";
import { LabelsService, ApiError } from "@/client";
import useCustomToast from "./useCustomToast";

export function useLabels(projectId: string | number) {
  const showToast = useCustomToast();

  return useQuery(
    ["labels", projectId],
    async () => {
      const response = await LabelsService.readLabelsByProject({
        projectId: Number(projectId),
      });

      return response.map((label) => ({
        id: label.label_id,
        name: label.name,
        color: label.color || "#FF0000",
      }));
    },
    {
      retry: 2, // 最多重试3次
      retryDelay: 1000, // 重试间隔1秒
      onError: (error: ApiError) => {
        // 只有在不是 404 错误时才显示 toast
        if (error.status !== 404) {
          showToast("Error", error, "error");
        }
      },
      // 如果需要可以设置缓存时间
      // staleTime: 3 * 1000, // 数据30秒内认为是新鲜的
      // cacheTime: 1 * 60 * 1000, // 缓存5分钟
    }
  );
}
