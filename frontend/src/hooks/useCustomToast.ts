import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { ApiError } from "@/client";

type ToastStatus = "success" | "error" | "warning" | "info";

const useCustomToast = () => {
  const toast = useToast();

  const showToast = useCallback(
    (title: string, description: string | Error, status: ToastStatus) => {
      let finalDescription: string;

      if (description instanceof Error) {
        if ("body" in description) {
          // 处理 ApiError
          const apiError = description as ApiError;
          finalDescription =
            apiError.body?.detail ||
            apiError.message ||
            "Unknown error occurred";
        } else {
          // 处理普通 Error
          finalDescription = description.message || "Unknown error occurred";
        }
      } else {
        finalDescription = description;
      }

      toast({
        title,
        description: finalDescription,
        status,
        isClosable: true,
        position: "bottom-right",
      });
    },
    [toast]
  );

  return showToast;
};

export default useCustomToast;

// // 1. 最基础的使用方式 - 直接传入字符串
// const showToast = useCustomToast();
// showToast("Success", "Operation completed successfully", "success");

// // 2. 处理 API Error (来自 mutation)
// const mutation = useMutation(addProject, {
//   onError: (err: ApiError) => {
//     showToast("Error", err, "error");  // err 是 ApiError 类型
//   }
// });

// // 3. 处理 React Query 的错误
// const { error, isError } = useQuery("someData", fetchData);
// if (isError) {
//   showToast("Query Error", error, "error");
// }

// // 4. 处理普通的 JavaScript Error
// try {
//   // 一些可能抛出错误的代码
//   throw new Error("Something went wrong");
// } catch (err) {
//   showToast("Error", err as Error, "error");
// }

// // 5. 显示警告信息
// showToast("Warning", "Please check your input", "warning");

// // 6. 显示信息提示
// showToast("Info", "Your data is being processed", "info");

// // 7. 处理网络请求错误
// try {
//   const response = await fetch('/api/data');
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
// } catch (err) {
//   showToast("Network Error", err as Error, "error");
// }
