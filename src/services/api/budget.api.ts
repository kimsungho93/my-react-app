import { apiClient } from "./client";
import type { DepartmentBudget, BudgetUsage, BudgetDeductRequest } from "../../types/dashboard.types";

/**
 * 예산 관련 API 서비스
 */
export const budgetApi = {
  /**
   * 특정 년월 예산 조회
   * @param year - 조회할 년도
   * @param month - 조회할 월
   * @returns 예산 정보
   */
  getBudget: async (year: number, month: number): Promise<DepartmentBudget> => {
    const response = await apiClient.get<DepartmentBudget>(
      `/budget/${year}/${month}`
    );
    return response.data;
  },

  /**
   * 예산 사용 이력 조회
   * @param budgetId - 예산 ID
   * @returns 예산 사용 이력 목록
   */
  getBudgetUsageHistory: async (budgetId: number): Promise<BudgetUsage[]> => {
    const response = await apiClient.get<BudgetUsage[]>(
      `/budget/${budgetId}/usage-history`
    );
    return response.data;
  },

  /**
   * 예산 차감
   * @param budgetId - 차감할 예산 ID
   * @param request - 차감 요청 정보 (금액, 사유, 사용일자)
   * @returns 생성된 사용 이력 정보
   */
  deductBudget: async (
    budgetId: number,
    request: BudgetDeductRequest
  ): Promise<BudgetUsage> => {
    const response = await apiClient.post<BudgetUsage>(
      `/budget/${budgetId}/deduct`,
      request
    );
    return response.data;
  },
};
