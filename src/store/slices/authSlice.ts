import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { AuthState, LoginRequest } from "../../types/auth.types";
import { authApi } from "../../services/api/auth.api";
import { tokenManager } from "../../utils/tokenManager";

/**
 * API 에러 응답 타입
 */
interface ApiErrorResponse {
  message?: string;
}

/**
 * 초기 상태
 */
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

/**
 * 로그인 비동기 액션
 */
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      // Access Token만 저장 (Refresh Token은 httpOnly 쿠키로 관리)
      tokenManager.setAccessToken(response.accessToken);

      return response;
    } catch (error) {
      // AxiosError 타입으로 처리
      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          "로그인에 실패했습니다.";
        return rejectWithValue(errorMessage);
      }
      // 예상치 못한 에러
      return rejectWithValue("알 수 없는 오류가 발생했습니다.");
    }
  }
);

/**
 * 로그아웃 비동기 액션
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout();
      // 서버에서 httpOnly 쿠키 삭제됨
      tokenManager.clearTokens();
    } catch (error) {
      // 로그아웃은 실패해도 토큰 삭제
      tokenManager.clearTokens();

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          "로그아웃에 실패했습니다.";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("알 수 없는 오류가 발생했습니다.");
    }
  }
);

/**
 * 현재 사용자 정보 조회 비동기 액션
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await authApi.getCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          "사용자 정보를 불러오지 못했습니다.";
        return rejectWithValue(errorMessage);
      }
      return rejectWithValue("알 수 없는 오류가 발생했습니다.");
    }
  }
);

/**
 * Auth 슬라이스
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * 에러 초기화
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * 인증 상태 초기화
     */
    resetAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 로그인
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = action.payload as string;
      });

    // 로그아웃
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });

    // 사용자 정보 조회
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
