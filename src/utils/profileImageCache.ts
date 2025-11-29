/**
 * 프로필 이미지 Presigned URL 캐시
 * - 중복 API 호출 방지
 * - 메모리 캐시 (새로고침 시 초기화)
 */

interface CacheEntry {
  presignedUrl: string;
  expiresAt: number; // timestamp (ms)
}

class ProfileImageCache {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 캐시에서 Presigned URL 조회
   * @param userId - 사용자 ID
   * @returns Presigned URL (만료되었거나 없으면 null)
   */
  get(userId: string): string | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;

    // 만료 체크 (10분 전부터 갱신 예정)
    const now = Date.now();
    const timeUntilExpiry = entry.expiresAt - now;
    if (timeUntilExpiry <= 10 * 60 * 1000) {
      // 10분 이하 남음 → 만료된 것으로 간주
      this.cache.delete(userId);
      return null;
    }

    return entry.presignedUrl;
  }

  /**
   * 캐시에 Presigned URL 저장
   * @param userId - 사용자 ID
   * @param presignedUrl - Presigned URL
   * @param expiresIn - 만료 시간 (초)
   */
  set(userId: string, presignedUrl: string, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    this.cache.set(userId, { presignedUrl, expiresAt });
  }

  /**
   * 특정 사용자의 캐시 삭제
   * @param userId - 사용자 ID
   */
  delete(userId: string): void {
    this.cache.delete(userId);
  }

  /**
   * 특정 사용자의 캐시 삭제 및 전역 이벤트 발행
   * 프로필 사진 변경 시 모든 컴포넌트에 알림
   * @param userId - 사용자 ID
   */
  deleteAndNotify(userId: string): void {
    this.cache.delete(userId);
    console.log("[ProfileImageCache] 캐시 삭제 및 이벤트 발행:", userId);
    // Custom Event 발행 (모든 useProfileImageUrl 훅에 알림)
    window.dispatchEvent(
      new CustomEvent("profileImageChanged", { detail: { userId } })
    );
  }

  /**
   * 전체 캐시 초기화
   */
  clear(): void {
    this.cache.clear();
  }
}

export const profileImageCache = new ProfileImageCache();
