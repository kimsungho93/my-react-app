import { useEffect, useMemo } from "react";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { store } from "./store";
import { router } from "./routes";
import { getTheme } from "./styles/theme";
import { useAppSelector, useAppDispatch } from "./hooks/useRedux";
import { fetchCurrentUser } from "./store/slices/authSlice";
import { tokenManager } from "./utils/tokenManager";

/**
 * 테마 프로바이더 래퍼 컴포넌트
 */
const ThemedApp = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);

  const theme = useMemo(() => getTheme(mode), [mode]);

  // 앱 초기화 시 Access Token이 있으면 사용자 정보 조회
  // Refresh Token은 httpOnly 쿠키로 자동 관리됨
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenManager.getAccessToken();

      if (accessToken) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Access Token이 유효하지 않으면 삭제
          // Refresh Token이 유효하다면 자동으로 갱신 시도됨 (인터셉터)
          tokenManager.clearTokens();
        }
      }
    };

    initAuth();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemedApp />
    </Provider>
  );
}

export default App;
