import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { tokenManager } from "../../utils/tokenManager";
import type { RefreshTokenResponse } from "../../types/auth.types";

/**
 * API 기본 URL
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// 개발 환경에서 디버깅용 로그
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:');
  console.log('  - VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('  - API_BASE_URL:', API_BASE_URL);
  console.log('  - Mode:', import.meta.env.MODE);
}

/**
 * Axios 인스턴스 생성
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // httpOnly 쿠키 전송을 위해 필수
});

/**
 * 토큰 갱신 중 여부 플래그
 */
let isRefreshing = false;

/**
 * 토큰 갱신 대기 중인 요청들
 */
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * 대기 중인 요청 처리
 */
const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * 요청 인터셉터
 * 모든 요청에 Access Token 추가
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 민감한 정보가 포함된 요청은 로깅하지 않음
    if (config.url?.includes('/auth/login') && config.data) {
      // 개발 환경에서만 경고 표시
      if (import.meta.env.DEV) {
        console.warn('[보안] 로그인 요청 - 비밀번호는 HTTPS를 통해 암호화되어 전송됩니다');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터
 * 401 에러 시 토큰 갱신 시도
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러이고, 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청 (httpOnly 쿠키의 refreshToken은 자동으로 전송됨)
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {}, // body는 비어있음 (refreshToken은 쿠키로 전송)
          {
            withCredentials: true, // 쿠키 전송 활성화
          }
        );

        const { accessToken } = response.data;
        // 새로운 refreshToken은 서버에서 Set-Cookie 헤더로 자동 설정됨

        // 새 Access Token 저장
        tokenManager.setAccessToken(accessToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그아웃
        processQueue(refreshError as AxiosError, null);
        tokenManager.clearTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
