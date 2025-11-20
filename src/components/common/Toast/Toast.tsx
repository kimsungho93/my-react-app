import { Snackbar, Alert, type AlertColor } from "@mui/material";
import { useState, useCallback } from "react";

/**
 * Toast 메시지 인터페이스
 */
export interface ToastMessage {
  message: string;
  severity: AlertColor;
}

/**
 * Toast Props
 */
interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  duration?: number;
  onClose: () => void;
}

/**
 * Toast 알림 컴포넌트
 *
 * @description
 * - MUI Snackbar를 활용한 토스트 알림
 * - 성공, 에러, 경고, 정보 메시지 표시
 * - 모바일 환경에 최적화된 위치 및 스타일
 */
export const Toast = ({
  open,
  message,
  severity = "success",
  duration = 3000,
  onClose,
}: ToastProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{
        top: { xs: 70, sm: 80 }, // 모바일 헤더 아래에 위치
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: "100%",
          maxWidth: { xs: "calc(100vw - 32px)", sm: "400px" },
          fontSize: { xs: "0.875rem", sm: "1rem" },
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

/**
 * Toast 훅
 *
 * @description
 * Toast 상태 관리를 위한 커스텀 훅
 *
 * @example
 * const { toast, showToast } = useToast();
 * showToast("성공적으로 저장되었습니다.", "success");
 * <Toast {...toast} />
 */
export const useToast = () => {
  const [toast, setToast] = useState<ToastProps>({
    open: false,
    message: "",
    severity: "success",
    onClose: () => {},
  });

  const showToast = useCallback(
    (message: string, severity: AlertColor = "success", duration?: number) => {
      setToast({
        open: true,
        message,
        severity,
        duration,
        onClose: () => setToast((prev) => ({ ...prev, open: false })),
      });
    },
    []
  );

  const closeToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    toast,
    showToast,
    closeToast,
  };
};
