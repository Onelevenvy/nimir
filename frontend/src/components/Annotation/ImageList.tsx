import {
  Box,
  Flex,
  Text,
  Spinner,
  AspectRatio,
  Image,
  Tooltip,
  Divider,
} from "@chakra-ui/react";
import { ProjectImage } from "@/types/Image";

interface ImageListProps {
  images: ProjectImage[];
  selectedImage: ProjectImage | null;
  isLoading: boolean;
  onImageSelect: (image: ProjectImage) => void;
}

export const ImageList = ({
  images,
  selectedImage,
  isLoading,
  onImageSelect,
}: ImageListProps) => {
  const currentIndex = selectedImage
    ? images.findIndex((img) => img.id === selectedImage.id) + 1
    : 0;

  return (
    <Flex
      direction="column"
      w="100%"
      maxW="100%"
      minW="100%"
      h="full"
      bg="white"
      borderRadius="md"
      boxShadow="sm"
    >
      <Text fontSize="lg" fontWeight="bold" p={3}>
        图片列表
      </Text>

      <Flex
        direction="column"
        flex={1}
        overflowY="auto"
        p={3}
        gap={3}
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "gray.50",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.300",
            borderRadius: "4px",
          },
        }}
      >
        {isLoading ? (
          <Spinner />
        ) : images.length === 0 ? (
          <Text color="gray.500">暂无图片</Text>
        ) : (
          images.map((image) => (
            <Tooltip
              key={image.id}
              label={image.name}
              placement="right"
              hasArrow
            >
              <Box
                onClick={() => onImageSelect(image)}
                cursor="pointer"
                borderWidth={selectedImage?.id === image.id ? "4px" : "2px"}
                borderColor={
                  selectedImage?.id === image.id ? "blue.500" : "gray.200"
                }
                borderRadius="md"
                overflow="hidden"
                w="full"
                flexShrink={0}
                transition="all 0.2s"
                _hover={{
                  borderColor: "blue.300",
                  transform: "scale(1.02)",
                }}
              >
                <AspectRatio ratio={1}>
                  <Image
                    src={image.url}
                    alt={image.name}
                    objectFit="cover"
                    w="100%"
                    h="100%"
                    borderRadius="md"
                    fallback={<Spinner />}
                  />
                </AspectRatio>
              </Box>
            </Tooltip>
          ))
        )}
      </Flex>

      <Divider />
      <Flex
        p={3}
        justify="center"
        align="center"
        borderTop="1px"
        borderColor="gray.100"
      >
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {currentIndex} / {images.length}
        </Text>
      </Flex>
    </Flex>
  );
};
