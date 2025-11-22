import React, { useState, useCallback } from "react";
// import type { MouseEvent } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Menu,
  MenuItem as MuiMenuItem,
  Badge,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ViewSidebar,
  Person,
  Settings,
  Logout,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuItem } from "../../types/menu.types";
import { MENU_DATA } from "../../utils/menuData";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { setDirection } from "../../store/slices/layoutSlice";
import { toggleTheme } from "../../store/slices/themeSlice";

/**
 * 수평 네비게이션 컴포넌트
 * 상단에 위치하며 드롭다운 메뉴 지원
 */
export const HorizontalNav = React.memo(() => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const dispatch = useAppDispatch(); // 추가
  const [anchorEl, setAnchorEl] = useState<Record<string, HTMLElement | null>>(
    {}
  );
  const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null
  ); // 추가
  const { mode } = useAppSelector((state) => state.theme); // 추가
  const isDark = mode === "dark"; // 추가

  // 테마 토글 핸들러 추가
  const handleThemeToggle = useCallback(
    () => dispatch(toggleTheme()),
    [dispatch]
  );

  // 레이아웃 전환 핸들러 추가
  const handleLayoutToggle = useCallback(
    () => dispatch(setDirection("vertical")),
    [dispatch]
  );

  // 사용자 메뉴 핸들러 추가
  const handleUserMenuOpen = useCallback(
    (e: React.MouseEvent<HTMLElement>) => setUserMenuAnchor(e.currentTarget),
    []
  );

  const handleUserMenuClose = useCallback(() => setUserMenuAnchor(null), []);

  // 메뉴 열기
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, menuId: string) =>
      setAnchorEl((prev) => ({ ...prev, [menuId]: event.currentTarget })),
    []
  );

  // 메뉴 닫기
  const handleMenuClose = useCallback(
    (menuId: string) => setAnchorEl((prev) => ({ ...prev, [menuId]: null })),
    []
  );

  // 메뉴 클릭
  const handleMenuClick = useCallback(
    (item: MenuItem, parentId?: string) => {
      if (item.path) {
        navigate(item.path);
        if (parentId) handleMenuClose(parentId);
      }
    },
    [navigate, handleMenuClose]
  );

  // 현재 경로 활성화 여부
  const isActive = useCallback(
    (path?: string) => path === pathname,
    [pathname]
  );

  // 서브 메뉴 렌더링
  const renderSubMenu = useCallback(
    (item: MenuItem) => {
      const hasChildren = Boolean(item.children?.length);
      const open = Boolean(anchorEl[item.id]);

      // 자식이 없는 단일 메뉴
      if (!hasChildren) {
        return (
          <Button
            key={item.id}
            onClick={() => handleMenuClick(item)}
            disabled={item.disabled}
            startIcon={item.icon && <item.icon />}
            sx={{
              color: isActive(item.path) ? "primary.main" : "text.primary",
              fontWeight: isActive(item.path) ? 600 : 400,
              mx: 0.5,
            }}
          >
            {item.badge ? (
              <Badge badgeContent={item.badge} color="error">
                {item.title}
              </Badge>
            ) : (
              item.title
            )}
          </Button>
        );
      }

      // 드롭다운 메뉴
      return (
        <React.Fragment key={item.id}>
          <Button
            onClick={(e) => handleMenuOpen(e, item.id)}
            endIcon={<KeyboardArrowDown />}
            startIcon={item.icon && <item.icon />}
            sx={{ color: "text.primary", mx: 0.5 }}
          >
            {item.title}
          </Button>

          <Menu
            anchorEl={anchorEl[item.id]}
            open={open}
            onClose={() => handleMenuClose(item.id)}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            sx={{ "& .MuiPaper-root": { minWidth: 200, mt: 0.5 } }}
          >
            {item.children!.map((child, index) => (
              <React.Fragment key={child.id}>
                {index > 0 && child.icon && <Divider />}
                <MuiMenuItem
                  onClick={() => handleMenuClick(child, item.id)}
                  disabled={child.disabled}
                  selected={isActive(child.path)}
                >
                  {child.icon && (
                    <ListItemIcon>
                      {child.badge ? (
                        <Badge badgeContent={child.badge} color="error">
                          <child.icon fontSize="small" />
                        </Badge>
                      ) : (
                        <child.icon fontSize="small" />
                      )}
                    </ListItemIcon>
                  )}
                  <ListItemText>{child.title}</ListItemText>
                </MuiMenuItem>
              </React.Fragment>
            ))}
          </Menu>
        </React.Fragment>
      );
    },
    [anchorEl, handleMenuOpen, handleMenuClose, handleMenuClick, isActive]
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
      <Toolbar>
        {/* 로고 */}
        <Box
          onClick={() => navigate("/")}
          sx={{
            mr: 4,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              height: 40,
              width: "auto",
              maxWidth: 150,
              objectFit: "contain",
            }}
          />
        </Box>

        {/* 메뉴 리스트 */}
        <Box sx={{ display: "flex", flexGrow: 1 }}>
          {MENU_DATA.map(renderSubMenu)}
        </Box>

        {/* 우측 영역: 레이아웃 토글 + 테마 토글 + 사용자 메뉴 */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {/* 레이아웃 전환 버튼 */}
          <Tooltip title="세로 메뉴로 전환">
            <IconButton
              onClick={handleLayoutToggle}
              size="medium"
              sx={{
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
            >
              <ViewSidebar />
            </IconButton>
          </Tooltip>

          {/* 테마 모드 토글 추가 */}
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
          {/* 사용자 메뉴 */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
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
            {/* 👇 이 부분이 누락되어 있었습니다 */}
            <MuiMenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              프로필
            </MuiMenuItem>
            <MuiMenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              설정
            </MuiMenuItem>
            <Divider />
            <MuiMenuItem>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              로그아웃
            </MuiMenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
});
