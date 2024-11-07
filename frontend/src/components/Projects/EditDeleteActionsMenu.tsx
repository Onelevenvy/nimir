import React from "react";
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash } from "react-icons/fi";
import EditProject from "./EditProject";
import DeleteAlert from "@/components/Common/DeleteAlert";
import { ProjectOut } from "@/client";

interface EditDeleteActionsMenuProps {
  projectId: number;
  project: ProjectOut;
}

const EditDeleteActionsMenu = ({
  projectId,
  project,
}: EditDeleteActionsMenuProps) => {
  const {
    isOpen: isDeleteOpen,
    onOpen: openDeleteDialog,
    onClose: closeDeleteDialog,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: openEditDialog,
    onClose: closeEditDialog,
  } = useDisclosure();

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<BsThreeDotsVertical />}
          variant="unstyled"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList>
          <MenuItem
            icon={<FiEdit fontSize="16px" />}
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog();
            }}
          >
            Edit Project
          </MenuItem>
          <MenuItem
            icon={<FiTrash fontSize="16px" />}
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog();
            }}
            color="ui.danger"
          >
            Delete Project
          </MenuItem>
        </MenuList>
      </Menu>

      <EditProject
        project={project}
        isOpen={isEditOpen}
        onClose={closeEditDialog}
      />

      <DeleteAlert
        type="Project"
        id={projectId}
        isOpen={isDeleteOpen}
        onClose={closeDeleteDialog}
      />
    </>
  );
};

export default EditDeleteActionsMenu;
