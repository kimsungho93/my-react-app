import { apiClient } from "./client";
import type { ActiveUserNamesResponse } from "../../types/user.types";

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
};
