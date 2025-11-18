import { apiClient } from "./client";
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  UserInfo,
} from "../../types/auth.types";

/**
 * 인증 관련 API 서비스
 */
export const authApi = {
  /**
   * 로그인
   * refreshToken은 서버에서 Set-Cookie 헤더로 httpOnly 쿠키에 저장
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  /**
   * 로그아웃
   * 서버에서 httpOnly 쿠키 삭제 처리
   */
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  /**
   * 토큰 갱신
   * refreshToken은 httpOnly 쿠키로 자동 전송됨
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<RefreshTokenResponse>(
      "/auth/refresh"
    );
    return response.data;
  },

  /**
   * 현재 사용자 정보 조회
   */
  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await apiClient.get<UserInfo>("/auth/me");
    return response.data;
  },
};
