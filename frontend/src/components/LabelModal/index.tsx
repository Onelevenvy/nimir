"use client";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Box,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { SketchPicker } from "react-color";

interface LabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (label: { id: number; name: string; color: string }) => void;
  label?: { id: number; name: string; color: string }; // 确保这里有 label 属性
}

export default function LabelModal({
  isOpen,
  onClose,
  onAdd,
  label,
}: LabelModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FF0000");
  const toast = useToast();

  useEffect(() => {
    if (label) {
      setName(label.name);
      setColor(label.color);
    } else {
      setName("");
      setColor("#FF0000");
    }
  }, [label]);

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "请输入标签名称",
        status: "error",
        duration: 2000,
      });
      return;
    }

    onAdd({
      id: label ? label.id : Date.now(), // Use existing id if editing
      name: name.trim(),
      color,
    });

    setName("");
    setColor("#FF0000");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{label ? "编辑标签" : "添加标签"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>标签名称</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入标签名称"
              />
            </FormControl>

            <FormControl>
              <FormLabel>标签颜色</FormLabel>
              <Box p={2} borderWidth={1} borderRadius="md">
                <SketchPicker
                  color={color}
                  onChange={(color: any) => setColor(color.hex)}
                  disableAlpha
                />
              </Box>
            </FormControl>

            <Button colorScheme="blue" width="full" onClick={handleSubmit}>
              {label ? "保存" : "添加"}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
