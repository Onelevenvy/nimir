import { useQuery } from 'react-query';
import axios from 'axios';
import { ProjectImage } from '@/types/Image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


// export const useOriginalImages = (projectId: string | number) => {
//   return useQuery<ProjectImage[]>(
//     ['original-images', projectId],
//     async () => {
//       const response = await axios.get(
//         `${API_BASE_URL}/api/v1/data/project/${projectId}/stage/original`
//       );
      
//       return response.data.map((item: any) => ({
//         id: item.data_id,
//         url: `${API_BASE_URL}/api/v1/data/${item.data_id}/image`,
//         name: item.path.split('/').pop() || '',
//         task_id: item.task_id,
//         type: 'original' as const,
//         metadata: item.metadata_
//       }));
//     },
//     {
//       enabled: !!projectId,
//       staleTime: 30000,
//       cacheTime: 5 * 60 * 1000,
//       retry: 2,
//     }
//   );
// };

// 获取工作流阶段的图片
export const useWorkflowStageImages = (
  projectId: number,
  stage: string,
  category?: string
) => {
  return useQuery<ProjectImage[]>(
    ['workflow-stage-images', projectId, stage, category],
    async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/data/project/${projectId}/stage/${stage}`,
        {
          params: { category }
        }
      );

      return response.data.map((item: any) => ({
        id: item.data_id,
        url: `${API_BASE_URL}/api/v1/data/${item.data_id}/image`,
        name: item.path.split('/').pop() || '',
        metadata: item.metadata_,
        type: 'processed' as const,
        category: item.category,
        stage: stage,
      }));
    },
    {
      enabled: !!projectId && !!stage,
      staleTime: 30000,
      cacheTime: 5 * 60 * 1000,
      retry: 2,
    }
  );
};
