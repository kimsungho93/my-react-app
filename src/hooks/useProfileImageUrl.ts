import { useState, useEffect, useCallback, useRef } from "react";
import { userApi } from "../services/api/user.api";
import { profileImageCache } from "../utils/profileImageCache";

/**
 * 프로필 이미지 Presigned URL을 관리하는 훅
 * - R2 버킷이 private이므로 Presigned URL을 통해 이미지에 접근
 * - URL 만료 전 자동 갱신 (만료 10분 전)
 * - 수동 갱신 기능 제공 (프로필 사진 변경 후 즉시 새 URL 조회)
 * - 캐싱을 통해 중복 API 호출 방지
 *
 * @param userId - 사용자 ID (필수)
 * @param profileImageUrl - 프로필 이미지 URL (선택, 의존성 추적용)
 */
export const useProfileImageUrl = (userId: string | undefined, profileImageUrl?: string | undefined) => {
  const [presignedUrl, setPresignedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);

  /**
   * Presigned URL 조회 (캐시 우선)
   */
  const fetchPresignedUrl = useCallback(async (skipCache = false) => {
    // userId가 없거나 profileImageUrl이 없으면 빈 URL 반환 (프로필 이미지 미설정 상태)
    if (!userId || !profileImageUrl) {
      setPresignedUrl("");
      setError(null);
      return;
    }

    // 캐시 확인 (skipCache가 true이면 캐시 무시)
    if (!skipCache) {
      const cachedUrl = profileImageCache.get(userId);
      if (cachedUrl) {
        setPresignedUrl(cachedUrl);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await userApi.getProfileImageUrl(userId);
      setPresignedUrl(response.presignedUrl);

      // 캐시에 저장
      profileImageCache.set(userId, response.presignedUrl, response.expiresIn);

      // 기존 타이머 제거
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }

      // URL 만료 10분 전에 자동 갱신 (expiresIn은 초 단위)
      const refreshTime = (response.expiresIn - 600) * 1000; // 10분 전 (밀리초)
      if (refreshTime > 0) {
        refreshTimerRef.current = window.setTimeout(() => {
          fetchPresignedUrl();
        }, refreshTime);
      }
    } catch (err) {
      console.error("Failed to fetch presigned URL:", err);
      // 프로필 이미지가 없는 경우는 정상 상황이므로 에러를 설정하지 않음
      setError(null);
      setPresignedUrl("");
    } finally {
      setLoading(false);
    }
  }, [userId, profileImageUrl]); // profileImageUrl 변경 시에도 재조회

  /**
   * 수동으로 Presigned URL 갱신
   * 프로필 사진 업로드 후 즉시 새 이미지를 표시하기 위해 사용
   */
  const refreshUrl = useCallback(() => {
    fetchPresignedUrl();
  }, [fetchPresignedUrl]);

  useEffect(() => {
    fetchPresignedUrl();

    // 클린업: 타이머 제거
    return () => {
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [fetchPresignedUrl]);

  /**
   * 강제 갱신 카운터가 변경되면 캐시를 무시하고 재조회
   * profileImageUrl이 없어도 userId만 있으면 조회 시도
   */
  useEffect(() => {
    if (forceRefreshCounter > 0 && userId) {
      console.log("[useProfileImageUrl] 강제 갱신 실행:", userId, forceRefreshCounter);

      // 강제 갱신 시에는 profileImageUrl 체크를 건너뛰고 바로 API 호출
      const forceRefresh = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await userApi.getProfileImageUrl(userId);
          setPresignedUrl(response.presignedUrl);

          // 캐시에 저장
          profileImageCache.set(userId, response.presignedUrl, response.expiresIn);

          // 기존 타이머 제거
          if (refreshTimerRef.current !== null) {
            window.clearTimeout(refreshTimerRef.current);
          }

          // URL 만료 10분 전에 자동 갱신
          const refreshTime = (response.expiresIn - 600) * 1000;
          if (refreshTime > 0) {
            refreshTimerRef.current = window.setTimeout(() => {
              fetchPresignedUrl();
            }, refreshTime);
          }
        } catch (err) {
          console.error("Failed to force refresh presigned URL:", err);
          setError(null);
          setPresignedUrl("");
        } finally {
          setLoading(false);
        }
      };

      forceRefresh();
    }
  }, [forceRefreshCounter, userId, fetchPresignedUrl]);

  /**
   * 프로필 사진 변경 이벤트 리스닝
   * 다른 컴포넌트에서 프로필 사진을 변경하면 즉시 갱신
   */
  useEffect(() => {
    const handleProfileImageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>;
      console.log("[useProfileImageUrl] 이벤트 수신:", customEvent.detail.userId, "현재 userId:", userId);
      // 현재 표시 중인 사용자의 프로필 사진이 변경되었으면 즉시 갱신
      if (customEvent.detail.userId === userId) {
        console.log("[useProfileImageUrl] 프로필 사진 갱신 시작:", userId);
        // 캐시는 이미 삭제되었으므로 강제로 API 호출 (skipCache = true)
        setForceRefreshCounter((prev) => prev + 1);
      }
    };

    window.addEventListener("profileImageChanged", handleProfileImageChange);

    return () => {
      window.removeEventListener("profileImageChanged", handleProfileImageChange);
    };
  }, [userId]);

  return { presignedUrl, loading, error, refreshUrl };
};
