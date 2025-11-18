const ACCESS_TOKEN_KEY = "access_token";

/**
 * 토큰 관리 유틸리티
 * Access Token은 메모리(sessionStorage)에 저장
 * Refresh Token은 httpOnly 쿠키로 서버에서 관리
 */
export const tokenManager = {
  /**
   * Access Token 저장 (메모리)
   */
  setAccessToken: (token: string) => {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  /**
   * Access Token 조회
   */
  getAccessToken: (): string | null => {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Refresh Token은 httpOnly 쿠키로 관리되므로 클라이언트에서 접근 불가
   * 아래 메서드들은 호환성을 위해 유지하지만 실제로는 사용하지 않음
   */
  setRefreshToken: (_token: string) => {
    // httpOnly 쿠키는 서버에서 설정하므로 클라이언트에서는 아무것도 하지 않음
    console.warn("Refresh token은 httpOnly 쿠키로 관리됩니다.");
  },

  getRefreshToken: (): string | null => {
    // httpOnly 쿠키는 클라이언트에서 접근 불가
    return null;
  },

  /**
   * Access Token 삭제
   */
  clearTokens: () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    // Refresh Token은 서버에서 쿠키 삭제 처리
  },
};
