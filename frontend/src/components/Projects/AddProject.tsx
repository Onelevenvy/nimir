import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Textarea,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { PROJECT_CATEGORIES, ProjectTaskType } from "@/types/project";
import { TbBoxModel2, TbCategory2 } from "react-icons/tb";
import { BiImage } from "react-icons/bi";
import { MdOutlineSegment } from "react-icons/md";
import { SiKashflow } from "react-icons/si";
import { BsTextareaT } from "react-icons/bs";
import { AiOutlineCluster } from "react-icons/ai";

import dayjs from "dayjs";

import { type ApiError, ProjectsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";

interface AddProjectProps {
  isOpen: boolean;
  onClose: () => void;
}

// 更新项目创建所需的数据类型，移除不需要的字段
interface ProjectCreate {
  name: string;
  description?: string;
  data_dir: string;
  task_category_id?: number;
}

const iconComponents = {
  TbBoxModel2,
  TbCategory2,
  BiImage,
  MdOutlineSegment,
  SiKashflow,
  BsTextareaT,
  AiOutlineCluster,
} as const;

const AddProject = ({ isOpen, onClose }: AddProjectProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProjectCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      description: "",
      data_dir: "",
      task_category_id: 0,
    },
  });

  // 实现项目创建的 API 调用
  const addProject = async (data: ProjectCreate) => {
    await ProjectsService.createProject({ requestBody: data });
  };

  const mutation = useMutation(addProject, {
    onSuccess: () => {
      showToast("Success!", "Project created successfully.", "success");
      reset();
      onClose();
    },
    onError: (err: ApiError) => {
      const errDetail = err.body?.detail;
      showToast("Something went wrong.", `${errDetail}`, "error");
    },
    onSettled: () => {
      queryClient.invalidateQueries("projects");
    },
  });

  const [selectedCategory, setSelectedCategory] = useState<ProjectTaskType>(
    ProjectTaskType.DETECTION
  );

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const onSubmit: SubmitHandler<ProjectCreate> = (data) => {
    const timestamp = dayjs().format("YYYYMMDD_HHmmss");
    const dataDir = `${data.name}_${timestamp}`;

    mutation.mutate({
      ...data,
      task_category_id: selectedCategory,
      data_dir: dataDir,
    });
  };

  // 项目类型卡片组件
  const CategoryCard: React.FC<{
    category: (typeof PROJECT_CATEGORIES)[0];
    isSelected: boolean;
    onClick: () => void;
  }> = ({ category, isSelected, onClick }) => {
    const Icon = iconComponents[category.icon as keyof typeof iconComponents];
    return (
      <Box
        bg={isSelected ? "gray.100" : "white.200"}
        height="125px"
        onClick={onClick}
        cursor="pointer"
        borderRadius="md"
        border={isSelected ? "2px solid #9ebbfe" : "2px solid #ecedf2"}
      >
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          mt={3}
          ml={3}
        >
          <IconButton
            colorScheme={category.colorScheme}
            aria-label={category.name}
            icon={<Icon size="24" />}
            backgroundColor={category.backgroundColor}
          />
          <Text textAlign="left" ml={3} fontSize="lg">
            {category.title}
          </Text>
        </Box>
        <Text
          textAlign="left"
          ml={3}
          pr="3"
          pt="3"
          fontSize="sm"
          color="gray.500"
        >
          {category.description}
        </Text>
      </Box>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>{"创建项目"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Text whiteSpace="nowrap" fontWeight="bold" pb="4">
            项目类型
          </Text>
          <SimpleGrid columns={3} spacing={6} pb={4}>
            {PROJECT_CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </SimpleGrid>

          <Box alignItems="left">
            <Text whiteSpace="nowrap" pb={2} fontWeight="bold">
              项目信息
            </Text>
            <FormControl isRequired isInvalid={!!errors.name}>
              <Input
                {...register("name", {
                  required: "项目名称不能为空",
                  pattern: {
                    value: /^[a-zA-Z0-9_-]{1,64}$/,
                    message:
                      "项目名称只能包含字母、数字、下划线和连字符，长度1-64",
                  },
                })}
                placeholder="请输入项目名称"
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
          </Box>

          <FormControl mt={4}>
            <FormLabel fontWeight="bold">项目描述</FormLabel>
            <Textarea
              {...register("description")}
              placeholder="请输入项目描述"
              resize="none"
            />
          </FormControl>

          <FormControl hidden>
            <Input {...register("data_dir")} />
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isValid}
          >
            保存
          </Button>
          <Button onClick={onClose}>取消</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddProject;
