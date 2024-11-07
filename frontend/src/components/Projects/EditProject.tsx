import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { type ApiError, type ProjectOut, ProjectsService } from "@/client";
import useCustomToast from "@/hooks/useCustomToast";

interface EditProjectProps {
  project: ProjectOut;
  isOpen: boolean;
  onClose: () => void;
}

// 更新项目所需的数据类型，与后端 API 保持一致
interface ProjectUpdate {
  name?: string | null;
  description?: string | null;
}

const EditProject = ({ project, isOpen, onClose }: EditProjectProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<ProjectUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
    },
  });

  // 实现项目更新的 API 调用
  const updateProject = async (data: ProjectUpdate) => {
    await ProjectsService.updateProject({
      projectId: project.project_id,
      requestBody: data,
    });
  };

  const mutation = useMutation(updateProject, {
    onSuccess: () => {
      showToast("Success!", "Project updated successfully.", "success");
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

  const onSubmit: SubmitHandler<ProjectUpdate> = (data) => {
    mutation.mutate(data);
  };

  const onCancel = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent as="form" onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader>编辑项目</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl isRequired isInvalid={!!errors.name}>
            <FormLabel fontWeight="bold">项目名称</FormLabel>
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

          <FormControl mt={4}>
            <FormLabel fontWeight="bold">项目描述</FormLabel>
            <Textarea
              {...register("description")}
              placeholder="请输入项目描述"
              resize="none"
            />
          </FormControl>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button
            variant="primary"
            type="submit"
            isLoading={isSubmitting}
            isDisabled={!isDirty || !isValid}
          >
            保存
          </Button>
          <Button onClick={onCancel}>取消</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditProject;
