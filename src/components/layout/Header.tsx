import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ViewWeek,
  ViewSidebar,
  Logout,
  Settings,
  Person,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleCollapse, setDirection } from "../../store/slices/layoutSlice";
import { toggleTheme } from "../../store/slices/themeSlice";
import { logout } from "../../store/slices/authSlice";

/**
 * 레이아웃 헤더 컴포넌트
 * 레이아웃 토글, 테마 토글, 사용자 메뉴 제공
 */
export const Header = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { direction, collapsed } = useAppSelector((state) => state.layout);
  const { mode } = useAppSelector((state) => state.theme);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isVertical = direction === "vertical";
  const isDark = mode === "dark";

  // 레이아웃 방향 토글
  const handleLayoutToggle = useCallback(
    () => dispatch(setDirection(isVertical ? "horizontal" : "vertical")),
    [dispatch, isVertical]
  );

  // 사이드바 접기/펼치기
  const handleCollapseToggle = useCallback(
    () => dispatch(toggleCollapse()),
    [dispatch]
  );

  // 테마 모드 토글
  const handleThemeToggle = useCallback(
    () => dispatch(toggleTheme()),
    [dispatch]
  );

  // 사용자 메뉴 토글
  const handleUserMenuOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget),
    []
  );

  const handleUserMenuClose = useCallback(() => setAnchorEl(null), []);

  // 로그아웃 처리
  const handleLogout = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      handleUserMenuClose();

      try {
        await dispatch(logout()).unwrap();
        navigate("/login");
      } catch (error) {
        // 로그아웃 실패 시에도 로그인 페이지로 이동
        navigate("/login");
      }
    },
    [dispatch, navigate, handleUserMenuClose]
  );

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* 수직 레이아웃 메뉴 토글 버튼 */}
        {isVertical && (
          <Tooltip title={collapsed ? "메뉴 펼치기" : "메뉴 접기"}>
            <IconButton
              edge="start"
              onClick={handleCollapseToggle}
              size="medium"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}

        <Box sx={{ flexGrow: 1 }} />

        {/* 우측 아이콘 버튼 그룹 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* 레이아웃 방향 토글 */}
          <Tooltip title={isVertical ? "가로 메뉴로 전환" : "세로 메뉴로 전환"}>
            <IconButton
              onClick={handleLayoutToggle}
              size="medium"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {isVertical ? <ViewWeek /> : <ViewSidebar />}
            </IconButton>
          </Tooltip>

          {/* 테마 모드 토글 */}
          <Tooltip title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}>
            <IconButton
              onClick={handleThemeToggle}
              size="medium"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              {isDark ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>

          {/* 사용자 프로필 */}
          <Tooltip title="계정 설정">
            <IconButton
              onClick={handleUserMenuOpen}
              size="medium"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                U
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* 사용자 메뉴 */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 200,
              mt: 1.5,
              "& .MuiMenuItem-root": {
                px: 2,
                py: 1.5,
              },
            },
          }}
        >
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            프로필
          </MenuItem>
          <MenuItem onClick={handleUserMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            설정
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});

Header.displayName = "Header";
