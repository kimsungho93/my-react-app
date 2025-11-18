// src/store/slices/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";

/**
 * 테마 모드 타입
 */
export type ThemeMode = "light" | "dark";

/**
 * 테마 상태 인터페이스
 */
interface ThemeState {
  mode: ThemeMode;
}

/**
 * 초기 상태
 * localStorage에서 저장된 테마를 불러오거나 시스템 설정 사용
 */
const getInitialTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem("theme-mode");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  // 시스템 다크모드 설정 확인
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
};

/**
 * 테마 Redux 슬라이스
 */
const themeSlice = createSlice({
  name: "theme",
  initialState: {
    mode: getInitialTheme(),
  } as ThemeState,
  reducers: {
    /**
     * 테마 모드 토글 (light ↔ dark)
     */
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", state.mode);
    },

    /**
     * 테마 모드 직접 설정
     */
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem("theme-mode", state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
