import { Box, Link, Icon, Text, HStack, Flex } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <Box as="footer" py={4} px={6} borderTop="1px solid" borderColor="gray.200">
      <Flex justify="space-between" align="center">
        <HStack spacing={6}>
          <HStack spacing={3}>
            <Link
              href="https://github.com/Onelevenvy/nimir"
              isExternal
              display="inline-flex"
              alignItems="center"
              opacity={0.7}
              _hover={{ opacity: 1 }}
            >
              <Icon as={FaGithub} boxSize={5} />
              <Text ml={2}>Nimir</Text>
            </Link>
            <Text color="gray.500">
              基于workflow的标注，训练，推理一体化平台
            </Text>
          </HStack>

          <Box borderLeft="1px solid" borderColor="gray.300" height="20px" />

          <Link
            href="https://github.com/Onelevenvy/flock"
            isExternal
            display="inline-flex"
            alignItems="center"
            opacity={0.7}
            _hover={{ opacity: 1 }}
          >
            <Icon as={FaGithub} boxSize={5} />
            <Text ml={2}>Flock</Text>
          </Link>
          <Text color="gray.500">
            基于langgraph的低代码平台，用于快速构建聊天机器人、RAG应用和muti-agent团队
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Footer;
