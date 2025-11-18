import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/useRedux";
import { CircularProgress, Box } from "@mui/material";

/**
 * 인증이 필요한 라우트 보호 컴포넌트
 */
export const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  // 인증 상태 확인 중
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 인증된 경우 자식 라우트 렌더링
  return <Outlet />;
};
