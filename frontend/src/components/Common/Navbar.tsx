import { Button, Flex, Icon, useDisclosure } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import AddProject from "../Projects/AddProject";

interface NavbarProps {
  type: string;
}

const Navbar = ({ type }: NavbarProps) => {
  const addProjectModal = useDisclosure();

  return (
    <>
      <Flex gap={2}>
        <Button
          variant="primary"
          gap={1}
          fontSize="sm"
          onClick={addProjectModal.onOpen}
        >
          <Icon as={FaPlus} /> 创建项目
        </Button>
        <AddProject
          isOpen={addProjectModal.isOpen}
          onClose={addProjectModal.onClose}
        />
      </Flex>
    </>
  );
};

export default Navbar;
