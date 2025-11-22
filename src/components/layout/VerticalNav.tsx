import React, { useCallback } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  Box,
  Divider,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuItem } from "../../types/menu.types";
import { MENU_DATA } from "../../utils/menuData";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { toggleMenu } from "../../store/slices/layoutSlice";

interface VerticalNavProps {
  collapsed: boolean;
  drawerWidth: number;
  onClose?: () => void; // 모바일에서 드로어 닫기 콜백
}

/**
 * 수직 네비게이션 컴포넌트
 * 계층적 메뉴 구조를 지원하며 접기/펼치기 기능 제공
 */
export const VerticalNav: React.FC<VerticalNavProps> = React.memo(
  ({ collapsed, drawerWidth, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    // Redux에서 열린 메뉴 상태 가져오기
    const openMenus = useAppSelector((state) => state.layout.openMenus);

    /**
     * 하위 메뉴 토글 핸들러
     */
    const handleToggle = useCallback(
      (menuId: string) => {
        dispatch(toggleMenu(menuId));
      },
      [dispatch]
    );

    /**
     * 메뉴 클릭 핸들러
     * 모바일에서는 메뉴 선택 후 드로어 자동 닫기
     */
    const handleMenuClick = useCallback(
      (item: MenuItem) => {
        if (item.children) {
          handleToggle(item.id);
        } else if (item.path) {
          navigate(item.path);
          // 모바일에서 메뉴 선택 후 드로어 닫기
          onClose?.();
        }
      },
      [handleToggle, navigate, onClose]
    );

    /**
     * 현재 경로와 메뉴 경로 일치 여부 확인
     */
    const isActive = useCallback(
      (path?: string) => {
        return path ? location.pathname === path : false;
      },
      [location.pathname]
    );

    /**
     * 재귀적으로 메뉴 아이템 렌더링
     */
    const renderMenuItem = useCallback(
      (item: MenuItem, depth = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus[item.id] || false;
        const active = isActive(item.path);

        const menuButton = (
          <ListItemButton
            onClick={() => handleMenuClick(item)}
            disabled={item.disabled}
            selected={active}
            sx={{
              pl: 2 + depth * 2, // depth에 따른 들여쓰기 증가 (각 depth마다 2 단위씩)
              pr: 2,
              minHeight: 44, // 모바일 터치 타겟 크기
              justifyContent: "flex-start",
              borderLeft: depth > 0 ? 3 : 0, // 하위 메뉴에 왼쪽 보더 추가
              borderColor: depth > 0 ? (depth === 1 ? "primary.light" : "secondary.light") : "transparent", // depth별 보더 색상
              backgroundColor:
                depth === 0 ? "transparent" :
                depth === 1 ? (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)" :
                (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)", // depth별 배경색 차별화
              "&:hover": {
                backgroundColor:
                  depth === 0 ? "action.hover" :
                  depth === 1 ? (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)" :
                  (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
              },
              "&.Mui-selected": {
                backgroundColor: "primary.light",
                borderLeftColor: "primary.main", // 선택된 하위 메뉴 보더 색상
                "&:hover": {
                  backgroundColor: "primary.light",
                },
              },
            }}
          >
            {item.icon && (
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 2, // 모바일에서 항상 마진 적용
                  justifyContent: "center",
                  color: active ? "primary.main" : "inherit",
                  fontSize: depth > 0 ? "1.25rem" : "1.5rem", // 하위 메뉴 아이콘 작게
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <item.icon fontSize={depth > 0 ? "small" : "medium"} />
                  </Badge>
                ) : (
                  <item.icon fontSize={depth > 0 ? "small" : "medium"} />
                )}
              </ListItemIcon>
            )}

            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize:
                  depth === 0 ? "0.875rem" :
                  depth === 1 ? "0.8125rem" :
                  "0.75rem", // depth별 폰트 크기 차별화
                fontWeight: active ? 600 : 400,
                sx: {
                  color:
                    depth === 0 ? "text.primary" :
                    depth === 1 ? "text.secondary" :
                    (theme) => theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)", // depth별 색상 차별화
                },
              }}
            />
            {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
        );

        return (
          <React.Fragment key={item.id}>
            {menuButton}

            {/* 하위 메뉴 렌더링 (모바일에서 항상 표시) */}
            {hasChildren && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List
                  component="div"
                  disablePadding
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? depth === 0 ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.04)"
                        : depth === 0 ? "rgba(0, 0, 0, 0.02)" : "rgba(0, 0, 0, 0.04)", // depth별 배경색 차별화
                  }}
                >
                  {item.children!.map((child) =>
                    renderMenuItem(child, depth + 1)
                  )}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      },
      [collapsed, openMenus, isActive, handleMenuClick]
    );

    return (
      <Drawer
        variant="temporary" // 모바일 전용: 임시 드로어
        open={!collapsed} // collapsed가 false일 때 드로어 열림
        onClose={onClose} // 백드롭 클릭 시 닫기
        ModalProps={{
          keepMounted: true, // 모바일 성능 최적화
        }}
        sx={{
          display: "block", // 모바일 전용으로 항상 표시
          zIndex: (theme) => theme.zIndex.drawer + 1,
          "& .MuiDrawer-paper": {
            width: drawerWidth, // 모바일에서는 항상 펼쳐진 상태
            maxWidth: "80vw", // 화면의 80% 이하
            boxSizing: "border-box",
            overflowX: "hidden",
            zIndex: (theme) => theme.zIndex.drawer + 1,
          },
        }}
      >
        {/* 로고 영역 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 56, // 모바일 헤더 높이와 동일
            px: 2,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Logo"
            sx={{
              height: 40,
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        <Divider />

        {/* 메뉴 리스트 */}
        <List sx={{ pt: 1, pb: 2 }}>
          {MENU_DATA.map((item) => renderMenuItem(item))}
        </List>
      </Drawer>
    );
  }
);

VerticalNav.displayName = "VerticalNav";
