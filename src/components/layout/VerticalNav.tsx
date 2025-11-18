import React, { useCallback } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Badge,
  Tooltip,
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
}

/**
 * 수직 네비게이션 컴포넌트
 * 계층적 메뉴 구조를 지원하며 접기/펼치기 기능 제공
 */
export const VerticalNav: React.FC<VerticalNavProps> = React.memo(
  ({ collapsed, drawerWidth }) => {
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
     */
    const handleMenuClick = useCallback(
      (item: MenuItem) => {
        if (item.children) {
          handleToggle(item.id);
        } else if (item.path) {
          navigate(item.path);
        }
      },
      [handleToggle, navigate]
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
              pl: 2 + depth * 2,
              minHeight: 48,
              justifyContent: collapsed ? "center" : "flex-start",
              px: 2.5,
              "&.Mui-selected": {
                backgroundColor: "primary.light",
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
                  mr: collapsed ? 0 : 2,
                  justifyContent: "center",
                  color: active ? "primary.main" : "inherit",
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    <item.icon />
                  </Badge>
                ) : (
                  <item.icon />
                )}
              </ListItemIcon>
            )}

            {!collapsed && (
              <>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: active ? 600 : 400,
                  }}
                />
                {hasChildren && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        );

        return (
          <React.Fragment key={item.id}>
            {collapsed && item.icon ? (
              <Tooltip title={item.title} placement="right">
                {menuButton}
              </Tooltip>
            ) : (
              menuButton
            )}

            {/* 하위 메뉴 렌더링 */}
            {hasChildren && !collapsed && (
              <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
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
        variant="permanent"
        sx={{
          width: collapsed ? 64 : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? 64 : drawerWidth,
            boxSizing: "border-box",
            transition: (theme) =>
              theme.transitions.create("width", {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: "hidden",
          },
        }}
      >
        {/* 로고 영역 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
            px: 2,
          }}
        >
          {collapsed ? (
            <Box component="span" sx={{ fontSize: 24, fontWeight: 700 }}>
              L
            </Box>
          ) : (
            <Box component="span" sx={{ fontSize: 20, fontWeight: 700 }}>
              LOGO
            </Box>
          )}
        </Box>

        <Divider />

        {/* 메뉴 리스트 */}
        <List sx={{ pt: 1 }}>
          {MENU_DATA.map((item) => renderMenuItem(item))}
        </List>
      </Drawer>
    );
  }
);

VerticalNav.displayName = "VerticalNav";
