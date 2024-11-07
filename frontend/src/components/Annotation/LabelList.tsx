import { VStack, Text, Button, Box, Flex, IconButton } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { Label } from "@/types/Label";

interface LabelListProps {
  labels: Label[];
  selectedLabel: Label | null;
  onLabelSelect: (label: Label | null) => void;
  onLabelEdit: (label: Label) => void;
  onAddLabel: () => void;
}

export function LabelList({
  labels,
  selectedLabel,
  onLabelSelect,
  onLabelEdit,
  onAddLabel,
}: LabelListProps) {
  return (
    <VStack h="full" w="full" spacing={0}>
      <Box p={4} w="full">
        <Text fontSize="lg" fontWeight="bold">标签列表</Text>
        <Button size="sm" colorScheme="blue" onClick={onAddLabel} mt={2}>
          添加标签
        </Button>
      </Box>
      <Box 
        flex={1} 
        w="full" 
        overflowY="auto"
        px={4}
        pb={4}
        sx={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '24px',
          },
        }}
      >
        {labels.map((label) => (
          <Box
            key={label.id}
            p={2}
            mb={2}
            bg={selectedLabel?.id === label.id ? "blue.50" : "white"}
            borderRadius="md"
            cursor="pointer"
            borderWidth="1px"
            borderColor={selectedLabel?.id === label.id ? "blue.200" : "gray.200"}
            _hover={{ bg: "gray.50" }}
          >
            <Flex justify="space-between" align="center">
              <Box
                flex={1}
                onClick={() => onLabelSelect(label)}
                display="flex"
                alignItems="center"
                gap={2}
              >
                <Box w="4" h="4" borderRadius="full" bg={label.color} />
                <Text fontSize="sm" noOfLines={1}>
                  {label.name}
                </Text>
              </Box>
              <IconButton
                aria-label="编辑标签"
                icon={<FaEdit />}
                size="sm"
                variant="ghost"
                colorScheme="blue"
                onClick={() => onLabelEdit(label)}
              />
            </Flex>
          </Box>
        ))}
      </Box>
    </VStack>
  );
}