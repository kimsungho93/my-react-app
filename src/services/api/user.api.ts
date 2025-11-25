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
};
