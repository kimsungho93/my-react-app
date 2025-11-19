import React, { useCallback } from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/useRedux";
import { toggleCollapse } from "../../store/slices/layoutSlice";
import { Header } from "./Header";
import { VerticalNav } from "./VerticalNav";

/**
 * 메인 레이아웃 컴포넌트 (모바일 전용)
 * 수직 드로어 네비게이션 + 헤더로 구성
 */
export const MainLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux에서 레이아웃 설정 가져오기
  const { collapsed, drawerWidth } = useAppSelector((state) => state.layout);

  // 드로어 닫기 핸들러
  const handleDrawerClose = useCallback(() => {
    if (!collapsed) {
      dispatch(toggleCollapse());
    }
  }, [collapsed, dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column", // 모바일: 세로 방향
      }}
    >
      {/* 모바일 드로어 네비게이션 */}
      <VerticalNav
        collapsed={collapsed}
        drawerWidth={drawerWidth}
        onClose={handleDrawerClose}
      />

      {/* 메인 컨텐츠 영역 */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%", // 모바일: 전체 너비
        }}
      >
        {/* 헤더 */}
        <Header />

        {/* 헤더 높이만큼 공간 확보 (모바일: 56px) */}
        <Box sx={{ height: 56 }} />

        {/* 페이지 컨텐츠 */}
        <Container
          maxWidth={false}
          disableGutters // 모바일: 좌우 기본 패딩 제거
          sx={{
            flexGrow: 1,
            py: 2, // 모바일: 상하 패딩 축소
            px: 2, // 모바일: 좌우 패딩 축소
            width: "100%",
            maxWidth: "100vw", // 모바일: viewport 너비 제한
            overflowX: "hidden", // 모바일: 가로 스크롤 방지
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};
