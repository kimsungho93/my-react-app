import type { SvgIconComponent } from "@mui/icons-material";

/**
 * 메뉴 아이템 기본 인터페이스
 */
export interface MenuItem {
  id: string;
  title: string;
  icon?: SvgIconComponent;
  path?: string;
  children?: MenuItem[];
  badge?: number | string; // 알림 배지
  disabled?: boolean;
}

/**
 * 레이아웃 방향 타입
 */
export type LayoutDirection = "vertical" | "horizontal";

/**
 * 레이아웃 설정 인터페이스
 */
export interface LayoutConfig {
  direction: LayoutDirection;
  collapsed: boolean;
  drawerWidth: number;
}
