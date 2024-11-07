"use client";
import { type ApiError, ProjectOut, ProjectsService } from "@/client";
import Navbar from "@/components/Common/Navbar";
import TabSlider from "@/components/Common/TabSlider";
import useCustomToast from "@/hooks/useCustomToast";
import { useTabSearchParams } from "@/hooks/useTabSearchparams";
import {
  Box,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Tag,
  TagLabel,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RiApps2Line } from "react-icons/ri";
import { useQuery } from "react-query";
import { PROJECT_CATEGORIES } from "@/types/project";
import EditDeleteActionsMenu from "@/components/Projects/EditDeleteActionsMenu";
import dayjs from "dayjs";

function Projects() {
  const showToast = useCustomToast();
  const { t } = useTranslation();
  const rowTint = useColorModeValue("blackAlpha.50", "whiteAlpha.50");
  const router = useRouter();

  const {
    data: projects,
    isLoading,
    isError,
    error,
  } = useQuery("projects", () => ProjectsService.readAllProjects({}));

  if (isError) {
    const errDetail = (error as ApiError).body?.detail;
    showToast("Something went wrong.", `${errDetail}`, "error");
  }

  const handleRowClick = (projectId: number) => {
    router.push(`/workflow?projectId=${projectId}&nodeType=image_source`);
  };

  const options = [
    {
      value: "all",
      text: "所有项目",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "0",
      text: "目标检测",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "1",
      text: "图像分类",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "2",
      text: "实例分割",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "3",
      text: "语义分割",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "4",
      text: "字符识别",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "5",
      text: "非监督学习",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
    {
      value: "6",
      text: "工作流",
      icon: <RiApps2Line className="w-[14px] h-[14px] mr-1" />,
    },
  ];

  const [activeTab, setActiveTab] = useTabSearchParams({
    searchParamName: "type",
    defaultTab: "all",
  });

  const filteredProjects = useMemo(() => {
    if (activeTab === "all") {
      return projects;
    }
    const categoryId = parseInt(activeTab);
    return projects?.filter(
      (project: ProjectOut) => project.task_category_id === categoryId
    );
  }, [activeTab, projects]);

  const getProjectTypeName = (
    categoryId: number | null | undefined
  ): string => {
    const category = PROJECT_CATEGORIES.find((cat) => cat.id === categoryId);
    return category?.title || "N/A";
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY-MM-DD HH:mm");
  };

  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        filteredProjects && (
          <Box
            maxW="full"
            maxH="full"
            display="flex"
            flexDirection={"column"}
            overflow={"hidden"}
          >
            <Box
              display="flex"
              flexDirection={"row"}
              justifyItems={"center"}
              py={2}
              px={5}
            >
              <Box>
                <TabSlider
                  value={activeTab}
                  onChange={setActiveTab}
                  options={options}
                />
              </Box>
              <Box ml={"auto"}>
                <Navbar type={"Project"} />
              </Box>
            </Box>
            <Box mt={2} overflow={"auto"}>
              <Box maxH="full">
                <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} mx={5}>
                  {filteredProjects.map((project: ProjectOut) => (
                    <Box
                      key={project.project_id}
                      _hover={{ backgroundColor: rowTint }}
                      cursor={"pointer"}
                      onClick={() => handleRowClick(project.project_id)}
                      p={4}
                      borderRadius="xl"
                      borderWidth="1px"
                      borderColor="gray.200"
                      boxShadow="lg"
                      bg="white"
                    >
                      <Flex justify="space-between" alignItems="center">
                        <Box>
                          <Heading as="h4" size="md">
                            {project.name}
                          </Heading>
                        </Box>
                      </Flex>
                      <Box mt={3} minH={"20"}>
                        <Text
                          color={!project.description ? "gray.400" : "gray.400"}
                          noOfLines={2}
                        >
                          {project.description || "N/A"}
                        </Text>
                      </Box>
                      <Box
                        display="flex"
                        flexDirection={"row"}
                        mt={3}
                        alignItems={"center"}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Tag
                            variant="outline"
                            colorScheme="green"
                            size={"sm"}
                          >
                            <TagLabel>
                              {getProjectTypeName(project.task_category_id)}
                            </TagLabel>
                          </Tag>
                        </Box>
                        <Text>{formatDate(project.modified)}</Text>
                        <Box>
                          <EditDeleteActionsMenu
                            projectId={project.project_id}
                            project={project}
                          />
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </Box>
          </Box>
        )
      )}
    </>
  );
}

export default Projects;
