/**
 * 애플리케이션 전역 상수
 */

/**
 * 기본 프로필 이미지 URL
 * 사용자의 profileImageUrl이 없을 때 사용되는 기본 아바타 이미지
 */
export const DEFAULT_PROFILE_IMAGE = "/default-avatar.png";

/**
 * 프로필 이미지 업로드 제한
 */
export const PROFILE_IMAGE_CONSTRAINTS = {
  /** 최대 파일 크기 (바이트) */
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  /** 권장 이미지 크기 (픽셀) */
  RECOMMENDED_SIZE: 150,
  /** 허용되는 MIME 타입 */
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
} as const;
