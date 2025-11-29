import { apiClient } from "./client";
import type { ActiveUserNamesResponse } from "../../types/user.types";
import type { ActiveMemberCountResponse } from "../../types/vote.types";

/**
 * 백엔드 공통 응답 타입
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * 프로필 사진 변경 응답 데이터
 */
interface UpdateProfileImageResponse {
  userId: number; // Java Long -> JavaScript number
  profileImageUrl: string;
  updatedAt: string; // ISO 8601 형식 (예: "2025-11-30T12:00:00")
}

/**
 * 프로필 이미지 Presigned URL 응답 데이터
 */
interface ProfileImageUrlResponse {
  presignedUrl: string;
  expiresIn: number; // 만료 시간 (초)
}

/**
 * 사용자 관련 API 서비스
 */
export const userApi = {
  /**
   * 활성 사용자 이름 목록 조회
   * @returns 활성 사용자 이름 목록
   */
  getActiveUserNames: async (): Promise<string[]> => {
    const response = await apiClient.get<ActiveUserNamesResponse>(
      "/users/active/names"
    );
    return response.data.names;
  },

  /**
   * 활성 회원 수 조회
   * @returns 활성 회원 수
   */
  getActiveCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<ActiveMemberCountResponse>>(
      "/users/active/count"
    );
    return response.data.data.activecount;
  },

  /**
   * 프로필 사진 변경
   * @param profileImage - 프로필 이미지 파일 (150x150px 권장, 최대 5MB)
   * @param currentPassword - 현재 비밀번호 (보안 확인용)
   * @returns 업데이트된 프로필 정보
   */
  updateProfileImage: async (
    profileImage: File,
    currentPassword: string
  ): Promise<UpdateProfileImageResponse> => {
    const formData = new FormData();
    formData.append("profileImage", profileImage);
    formData.append("currentPassword", currentPassword);

    const response = await apiClient.patch<UpdateProfileImageResponse>(
      "/users/profile/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // 서버가 ApiResponse 래퍼 없이 직접 데이터를 반환
    return response.data;
  },

  /**
   * 프로필 이미지 Presigned URL 조회
   * @param userId - 사용자 ID
   * @returns Presigned URL 및 만료 시간
   */
  getProfileImageUrl: async (userId: string): Promise<ProfileImageUrlResponse> => {
    const response = await apiClient.get<ProfileImageUrlResponse>(
      `/users/${userId}/profile/image-url`
    );
    // 서버가 ProfileImageUrlResponse를 직접 반환
    return response.data;
  },
};
