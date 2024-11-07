import { useEffect } from "react";
import { ToolType } from "@/types/ToolType";
import { Shortcuts } from "@/config/shortcuts";

export const useAnnotationShortcuts = (
  setSelectedTool: (tool: ToolType) => void,
  switchImage: (direction: "prev" | "next") => void,
  saveAnnotations: () => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === Shortcuts.tools.polygon.toLowerCase()) {
        setSelectedTool("polygon");
      } else if (key === Shortcuts.tools.rectangle.toLowerCase()) {
        setSelectedTool("rectangle");
      } else if (key === Shortcuts.tools.move.toLowerCase()) {
        setSelectedTool("move");
      } else if (key === Shortcuts.tools.edit.toLowerCase()) {
        setSelectedTool("edit");
      }

      if (!e.ctrlKey && !e.metaKey) {
        if (key === Shortcuts.navigation.previousImage.toLowerCase()) {
          switchImage("prev");
        } else if (key === Shortcuts.navigation.nextImage.toLowerCase()) {
          switchImage("next");
        }
      }

      if ((e.ctrlKey || e.metaKey) && key === "s") {
        e.preventDefault();
        saveAnnotations();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setSelectedTool, switchImage, saveAnnotations]);
};
