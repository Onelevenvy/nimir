import { ProjectsService } from "@/client/services/ProjectsService";
import { useQuery, useMutation, useQueryClient } from "react-query";
import useCustomToast from "./useCustomToast";

export function useProject() {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const { data: projects, isLoading } = useQuery(
    ["projects"],
    () => ProjectsService.readAllProjects({ orderBy: "modified desc" }),
    {
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to load projects",
          "error"
        );
      },
    }
  );

  const createProject = useMutation(
    (projectData: any) =>
      ProjectsService.createProject({ requestBody: projectData }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["projects"]);
        showToast("Success", "Project created successfully", "success");
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to create project",
          "error"
        );
      },
    }
  );

  const deleteProject = useMutation(
    (projectId: number) => ProjectsService.deleteProject({ projectId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["projects"]);
        showToast("Success", "Project deleted successfully", "success");
      },
      onError: (error: any) => {
        showToast(
          "Error",
          error.body?.detail || "Failed to delete project",
          "error"
        );
      },
    }
  );

  return {
    projects,
    isLoading,
    createProject,
    deleteProject,
  };
}
