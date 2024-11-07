import { useState, useCallback, RefObject } from "react";
import { Annotation } from "@/types/Annotation";
import { AnnotationsService, ApiError, AnnotationCreate } from "@/client";
import useCustomToast from "./useCustomToast";
import { ProjectImage } from "@/types/Image";

interface CanvasRef {
  exportToLabelme: () => any;
}

export const useAnnotations = (
  projectId: string,
  selectedImage: ProjectImage | null,
  processingStage: string = "preprocess"
) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const showToast = useCustomToast();

  const loadAnnotations = useCallback(async () => {
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
      console.error("Failed to load annotations:", error);
      showToast("Error", "Failed to load annotations", "error");
      setAnnotations([]);
    }
  }, [selectedImage, showToast]);

  const saveAnnotations = useCallback(
    async (canvasRef: RefObject<CanvasRef>) => {
      if (!selectedImage) {
        showToast("Error", "No image selected", "error");
        return;
      }

      try {
        const labelmeData = canvasRef.current?.exportToLabelme();

        const annotationsToSave: AnnotationCreate[] = annotations.map((ann) => {
          if (!ann.labelId) {
            throw new Error("Label ID is required");
          }

          return {
            type: ann.type,
            points: ann.points.join(","),
            color: ann.color,
            label_id: ann.labelId,
            data_id: selectedImage.id,
            project_id: Number(projectId),
            labelme_data: labelmeData || null,
            frontend_id: null,
            annotation_id: null,
          };
        });

        await AnnotationsService.updateDataAnnotations({
          dataId: selectedImage.id,
          processingStage,
          requestBody: annotationsToSave,
          workflowExecutionId: selectedImage.workflow_execution_id || null,
          nodeExecutionId: selectedImage.node_execution_id || null,
        });

        setHasUnsavedChanges(false);
        showToast("Success", "Annotations saved successfully", "success");
      } catch (error) {
        console.error("Save annotation error:", error);
        const errDetail = (error as ApiError).body?.detail;
        showToast("Error", errDetail || "Failed to save annotations", "error");
      }
    },
    [selectedImage, annotations, projectId, showToast, processingStage]
  );

  const handleAnnotationDelete = useCallback(
    async (annotation: Annotation, canvasRef: RefObject<CanvasRef>) => {
      if (!selectedImage) {
        showToast("Error", "No image selected", "error");
        return;
      }

      const newAnnotations = annotations.filter((a) => a.id !== annotation.id);
      setAnnotations(newAnnotations);
      setHasUnsavedChanges(true);

      try {
        const labelmeData = canvasRef.current?.exportToLabelme();

        const annotationsToSave: AnnotationCreate[] = newAnnotations.map(
          (ann) => {
            if (!ann.labelId) {
              throw new Error("Label ID is required");
            }

            return {
              type: ann.type,
              points: ann.points.join(","),
              color: ann.color,
              label_id: ann.labelId,
              data_id: selectedImage.id,
              project_id: Number(projectId),
              labelme_data: labelmeData || null,
              frontend_id: null,
              annotation_id: null,
            };
          }
        );

        await AnnotationsService.updateDataAnnotations({
          dataId: selectedImage.id,
          processingStage,
          requestBody: annotationsToSave,
          workflowExecutionId: selectedImage.workflow_execution_id || null,
          nodeExecutionId: selectedImage.node_execution_id || null,
        });

        setHasUnsavedChanges(false);
        showToast("Success", "Annotation deleted successfully", "success");
      } catch (error) {
        const errDetail = (error as ApiError).body?.detail;
        showToast(
          "Error",
          errDetail || "Failed to save after deletion",
          "error"
        );
      }
    },
    [annotations, selectedImage, projectId, showToast, processingStage]
  );

  return {
    annotations,
    setAnnotations,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    loadAnnotations,
    saveAnnotations,
    handleAnnotationDelete,
  };
};
