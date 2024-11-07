import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";

import { ProjectsService } from "../../client";
import useCustomToast from "../../hooks/useCustomToast";

interface DeleteProjectProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DeleteProject = ({ projectId, isOpen, onClose }: DeleteProjectProps) => {
  const queryClient = useQueryClient();
  const showToast = useCustomToast();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  const deleteProject = async () => {
    await ProjectsService.deleteProject({ projectId });
  };

  const mutation = useMutation(deleteProject, {
    onSuccess: () => {
      showToast("Success", "The project was deleted successfully.", "success");
      onClose();
    },
    onError: () => {
      showToast(
        "An error occurred.",
        "An error occurred while deleting the project.",
        "error"
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries("projects");
    },
  });

  const onSubmit = async () => {
    mutation.mutate();
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>Delete Project</AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? You will not be able to undo this action.
          </AlertDialogBody>

          <AlertDialogFooter gap={3}>
            <Button
              variant="danger"
              type="submit"
              isLoading={isSubmitting || mutation.isLoading}
            >
              Delete
            </Button>
            <Button
              ref={cancelRef}
              onClick={onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteProject;
