import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit, FiTrash } from "react-icons/fi";

import EditUser from "@/components/Admin/EditUser";
import Delete from "@/components/Common/DeleteAlert";

import type { UserOut } from "../../client";

interface ActionsMenuProps {
  type: string;
  value: UserOut;
  disabled?: boolean;
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure();
  const deleteModal = useDisclosure();

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
          onClick={(e) => e.stopPropagation()}
        />
        <MenuList>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              editUserModal.onOpen();
            }}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              deleteModal.onOpen();
            }}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        (
        <EditUser
          user={value as UserOut}
          isOpen={editUserModal.isOpen}
          onClose={editUserModal.onClose}
        />
        )
        <Delete
          type={type}
          id={value.id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  );
};

export default ActionsMenu;
