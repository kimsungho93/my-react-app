import React from "react";
import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../hooks/useRedux";
import { Header } from "./Header";
import { HorizontalNav } from "./HorizontalNav";
import { VerticalNav } from "./VerticalNav";

/**
 * 메인 레이아웃 컴포넌트
 * 레이아웃 방향에 따라 수직/수평 네비게이션을 동적으로 렌더링
 */
export const MainLayout: React.FC = () => {
  // Redux에서 레이아웃 설정 가져오기
  const { direction, collapsed, drawerWidth } = useAppSelector(
    (state) => state.layout
  );

  const isVertical = direction === "vertical";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* 수직 레이아웃: 사이드바 + 헤더 */}
      {isVertical ? (
        <>
          <VerticalNav collapsed={collapsed} drawerWidth={drawerWidth} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Header />
            {/* 헤더 높이만큼 공간 확보 */}
            <Box sx={{ height: 64 }} />
            {/* 페이지 컨텐츠 */}
            <Container
              maxWidth={false}
              sx={{
                flexGrow: 1,
                py: 3,
                px: 3,
              }}
            >
              <Outlet />
            </Container>
          </Box>
        </>
      ) : (
        /* 수평 레이아웃: 상단 네비게이션 */
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <HorizontalNav />
          {/* AppBar 높이만큼 공간 확보 */}
          <Box sx={{ height: 64 }} />
          {/* 페이지 컨텐츠 */}
          <Container
            maxWidth={false}
            sx={{
              flexGrow: 1,
              py: 3,
              px: 3,
            }}
          >
            <Outlet />
          </Container>
        </Box>
      )}
    </Box>
  );
};
