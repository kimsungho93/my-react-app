import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { LayoutConfig, LayoutDirection } from "../../types/menu.types";

/**
 * 레이아웃 상태 인터페이스
 */
interface LayoutState extends LayoutConfig {
  openMenus: Record<string, boolean>; // 열린 메뉴 상태 관리
}

/**
 * 초기 상태
 * localStorage에서 저장된 설정을 불러오거나 기본값 사용
 */
const getInitialState = (): LayoutState => {
  const savedConfig = localStorage.getItem("layout-config");

  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig);
      return {
        ...parsed,
        openMenus: {}, // openMenus는 세션마다 초기화
      };
    } catch {
      // 파싱 실패 시 기본값 사용
    }
  }

  return {
    direction: "vertical",
    collapsed: false,
    drawerWidth: 220,
    openMenus: {},
  };
};

/**
 * 레이아웃 Redux 슬라이스
 */
const layoutSlice = createSlice({
  name: "layout",
  initialState: getInitialState(),
  reducers: {
    /**
     * 사이드바 접기/펼치기 토글
     */
    toggleCollapse: (state) => {
      state.collapsed = !state.collapsed;
      // localStorage에 저장
      localStorage.setItem(
        "layout-config",
        JSON.stringify({
          direction: state.direction,
          collapsed: state.collapsed,
          drawerWidth: state.drawerWidth,
        })
      );
    },

    /**
     * 레이아웃 방향 설정 (vertical/horizontal)
     */
    setDirection: (state, action: PayloadAction<LayoutDirection>) => {
      state.direction = action.payload;
      // 수평 레이아웃으로 전환 시 collapsed 상태 초기화
      if (action.payload === "horizontal") {
        state.collapsed = false;
      }
      // localStorage에 저장
      localStorage.setItem(
        "layout-config",
        JSON.stringify({
          direction: state.direction,
          collapsed: state.collapsed,
          drawerWidth: state.drawerWidth,
        })
      );
    },

    /**
     * 사이드바 접힘 상태 직접 설정
     */
    setCollapsed: (state, action: PayloadAction<boolean>) => {
      state.collapsed = action.payload;
      // localStorage에 저장
      localStorage.setItem(
        "layout-config",
        JSON.stringify({
          direction: state.direction,
          collapsed: state.collapsed,
          drawerWidth: state.drawerWidth,
        })
      );
    },

    /**
     * 특정 메뉴 열기/닫기 토글
     */
    toggleMenu: (state, action: PayloadAction<string>) => {
      const menuId = action.payload;
      state.openMenus[menuId] = !state.openMenus[menuId];
    },

    /**
     * 모든 메뉴 닫기
     */
    closeAllMenus: (state) => {
      state.openMenus = {};
    },
  },
});

export const {
  toggleCollapse,
  setDirection,
  setCollapsed,
  toggleMenu,
  closeAllMenus,
} = layoutSlice.actions;

export default layoutSlice.reducer;
