/**
 * 로그인 요청 데이터
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 데이터
 * refreshToken은 httpOnly 쿠키로 전달되므로 응답 본문에서 제외
 */
export interface LoginResponse {
  accessToken: string;
  // refreshToken 제거 (httpOnly 쿠키로 전달됨)
  user: UserInfo;
}

/**
 * 토큰 갱신 응답 데이터
 * refreshToken은 httpOnly 쿠키로 전달되므로 응답 본문에서 제외
 */
export interface RefreshTokenResponse {
  accessToken: string;
  // refreshToken 제거 (httpOnly 쿠키로 전달됨)
}

/**
 * 사용자 정보
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  position: string;
  positionDisplayName: string;
}

/**
 * 비밀번호 변경 요청 데이터
 * 백엔드에서 이중 검증을 위해 confirmPassword도 전송
 * currentPassword로 현재 비밀번호 검증
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}
