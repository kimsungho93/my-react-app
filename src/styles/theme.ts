// src/styles/theme.ts

import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

/**
 * 테마 생성 함수
 * 다크모드/라이트모드에 따라 동적으로 테마 생성
 */
export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // 라이트 모드 색상
            primary: {
              main: "#1976d2",
              light: "#e3f2fd",
            },
            background: {
              default: "#f5f5f5",
              paper: "#ffffff",
            },
            text: {
              primary: "#222222",
              secondary: "#666666",
            },
          }
        : {
            // 다크 모드 색상
            primary: {
              main: "#90caf9",
              light: "#1e3a5f",
            },
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
            text: {
              primary: "#ffffff",
              secondary: "#b0b0b0",
            },
          }),
    },
    typography: {
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
      ].join(","),
    },
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight:
              mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.12)"
                : "1px solid rgba(255, 255, 255, 0.12)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow:
              mode === "light"
                ? "0 1px 3px rgba(0, 0, 0, 0.12)"
                : "0 1px 3px rgba(0, 0, 0, 0.4)",
          },
        },
      },
    },
  });
