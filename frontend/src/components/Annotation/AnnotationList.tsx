import {
  VStack,
  Text,
  Box,
  Flex,
  IconButton,
  List,
  ListItem,
  Divider,
} from "@chakra-ui/react";
import { FaTrashAlt } from "react-icons/fa";
import { Annotation } from "@/types/Annotation";
import { Label } from "@/types/Label";

interface AnnotationListProps {
  annotations: Annotation[];
  labels: Label[];
  onDelete: (index: number) => void;
}

export function AnnotationList({
  annotations,
  labels,
  onDelete,
}: AnnotationListProps) {
  return (
    <VStack h="full" w="full" spacing={0}>
      <Box p={4} w="full">
        <Text fontSize="lg" fontWeight="bold">
          标注列表
        </Text>
        <Divider mt={2} />
      </Box>
      <Box
        flex={1}
        w="full"
        overflowY="auto"
        px={4}
        pb={4}
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.300",
            borderRadius: "24px",
          },
        }}
      >
        <List spacing={2}>
          {annotations.map((annotation, index) => (
            <ListItem
              key={index}
              p={3}
              bg="gray.50"
              borderRadius="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Flex justify="space-between" align="center">
                <Flex align="center" gap={2}>
                  <Box w="3" h="3" borderRadius="full" bg={annotation.color} />
                  <Text fontSize="sm" color="gray.700">
                    {labels.find((l) => l.id === annotation.labelId)?.name ||
                      "未标记"}
                  </Text>
                </Flex>
                <Flex align="center" gap={2}>
                  <Text fontSize="sm" color="gray.500">
                    {annotation.type}
                  </Text>
                  <IconButton
                    aria-label="删除标注"
                    icon={<FaTrashAlt />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(index);
                    }}
                  />
                </Flex>
              </Flex>
            </ListItem>
          ))}
        </List>
      </Box>
    </VStack>
  );
}
