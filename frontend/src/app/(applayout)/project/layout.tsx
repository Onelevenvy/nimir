// components/Layout.tsx
"use client";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

// import Sidebar from "@/components/Common/SideBar";
import TopBar from "@/components/Common/TopBar";
import useAuth, { isLoggedIn } from "@/hooks/useAuth";
import Footer from "@/components/Common/Footer";

function Layout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const router = useRouter();
  const bgmain = useColorModeValue("ui.bgMain", "ui.bgMainDark");
  const currentPath = usePathname(); // 获取当前路径

  useEffect(() => {
    if (!isLoggedIn()) {
      // 如果用户未登录，重定向到登录页面
      router.push("/login");
    }
  }, [router]);

  if (isLoading || !isLoggedIn()) {
    // 如果用户未登录或正在加载，不渲染任何内容
    return null;
  }

  return (
    <>
      <Box
        bg={bgmain}
        borderRadius={"md"}
        minH={"100vh"}
        h={"100vh"}
        overflow={"hidden"}
      >
        <Flex
          maxW="full"
          maxH="full"
          h="full"
          position="relative"
          overflow="hidden"
          flexDirection={"row"}
        >
          <Box
            display="flex"
            w="full"
            maxW="full"
            minW="full"
            flexDirection={"column"}
          >
            <TopBar />
            <Box
              w="full"
              maxW="full"
              minW="full"
              overflow={"auto"}
              maxH="full"
              h="full"
              borderRadius={"md"}
            >
              {children}
            </Box>
            <Footer />
          </Box>
        </Flex>
      </Box>
    </>
  );
}

export default Layout;
