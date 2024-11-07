import { VStack, IconButton, Tooltip, Divider } from "@chakra-ui/react";
import { Tool } from "@/types/Tool";
import { FaSave, FaArrowLeft } from "react-icons/fa";

interface ToolBarProps {
  tools: Tool[];
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  onSave: () => void;
  onImport: () => void;
  onBack: () => void;
  hasUnsavedChanges: boolean;
  showSaveButton?: boolean;
}

export const ToolBar = ({
  tools,
  selectedTool,
  onToolSelect,
  onSave,
  onImport,
  onBack,
  hasUnsavedChanges,
  showSaveButton = true,
}: ToolBarProps) => {
  return (
    <VStack
      w="100%"
      bg="white"
      p={2}
      borderRadius="md"
      boxShadow="sm"
      h="full"
      justify="space-between"
      spacing={4}
    >
      <VStack spacing={4} flex={1} pt={2}>
        {tools.map((tool) => (
          <Tooltip
            key={tool.id}
            label={
              tool.shortcut ? `${tool.label} (${tool.shortcut})` : tool.label
            }
            placement="right"
            hasArrow
          >
            <IconButton
              aria-label={tool.label}
              icon={<tool.icon />}
              onClick={() => onToolSelect(tool.id)}
              colorScheme={selectedTool === tool.id ? "blue" : "gray"}
              size="lg"
            />
          </Tooltip>
        ))}
        <Divider />
        {showSaveButton && (
          <Tooltip label="保存标注 (Ctrl+S)" placement="right" hasArrow>
            <IconButton
              aria-label="保存标注"
              icon={<FaSave />}
              onClick={onSave}
              size="lg"
              isDisabled={!hasUnsavedChanges}
            />
          </Tooltip>
        )}
      </VStack>

      <Tooltip label="返回项目" placement="right" hasArrow>
        <IconButton
          aria-label="返回项目"
          icon={<FaArrowLeft />}
          onClick={onBack}
          size="lg"
          mb={2}
        />
      </Tooltip>
    </VStack>
  );
};
