// src/styles/theme.ts

import { createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

/**
 * 테마 생성 함수
 * 다크모드/라이트모드에 따라 동적으로 테마 생성
 */
export const getTheme = (mode: PaletteMode) =>
  createTheme({
    // 모바일 전용 브레이크포인트 설정
    breakpoints: {
      values: {
        xs: 0,
        sm: 375,    // 모바일 소형
        md: 390,    // 모바일 중형
        lg: 430,    // 모바일 대형
        xl: 768,    // 태블릿 (사용하지 않음)
      },
    },
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
      // 모바일 전용 폰트 크기
      h1: {
        fontSize: "2rem",      // 32px (데스크톱: 96px)
        fontWeight: 600,
      },
      h2: {
        fontSize: "1.75rem",   // 28px (데스크톱: 60px)
        fontWeight: 600,
      },
      h3: {
        fontSize: "1.5rem",    // 24px (데스크톱: 48px)
        fontWeight: 600,
      },
      h4: {
        fontSize: "1.25rem",   // 20px (데스크톱: 34px)
        fontWeight: 600,
      },
      h5: {
        fontSize: "1.125rem",  // 18px (데스크톱: 24px)
        fontWeight: 600,
      },
      h6: {
        fontSize: "1rem",      // 16px (데스크톱: 20px)
        fontWeight: 600,
      },
      body1: {
        fontSize: "0.875rem",  // 14px (데스크톱: 16px)
      },
      body2: {
        fontSize: "0.8125rem", // 13px (데스크톱: 14px)
      },
      button: {
        fontSize: "0.875rem",  // 14px
        textTransform: "none", // 대문자 변환 비활성화
      },
      caption: {
        fontSize: "0.75rem",   // 12px
      },
    },
    // 모바일 전용 간격 설정
    spacing: 8, // 기본 8px 유지하되 컴포넌트에서 더 작은 값 사용
    components: {
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight:
              mode === "light"
                ? "1px solid rgba(0, 0, 0, 0.12)"
                : "1px solid rgba(255, 255, 255, 0.12)",
            // 모바일에서 전체 화면
            width: "100%",
            maxWidth: 280,
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
            // 모바일 전용 헤더 높이
            minHeight: 56,
          },
        },
      },
      // 모바일 터치 타겟 최소 크기 보장
      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 44,
            padding: "8px 16px",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
      // 모바일 모달 최적화
      MuiDialog: {
        styleOverrides: {
          paper: {
            margin: 16,
            maxWidth: "calc(100% - 32px)",
          },
        },
      },
    },
  });
