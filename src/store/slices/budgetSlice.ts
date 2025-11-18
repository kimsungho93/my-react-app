import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import type { DepartmentBudget, BudgetUsage, BudgetDeductRequest } from "../../types/dashboard.types";
import { budgetApi } from "../../services/api/budget.api";

/**
 * API 에러 응답 타입
 */
interface ApiErrorResponse {
  message?: string;
}

/**
 * Budget 상태 타입
 */
export interface BudgetState {
  departmentBudget: DepartmentBudget | null;
  allBudgets: DepartmentBudget[];
  usageHistory: BudgetUsage[];
  loading: boolean;
  usageHistoryLoading: boolean;
  error: string | null;
}

/**
 * 초기 상태
 */
const initialState: BudgetState = {
  departmentBudget: null,
  allBudgets: [],
  usageHistory: [],
  loading: false,
  usageHistoryLoading: false,
  error: null,
};

/**
 * 특정 년월 예산 조회 비동기 액션
 */
export const fetchBudget = createAsyncThunk(
  "budget/fetchBudget",
  async (
    params: { year: number; month: number },
    { rejectWithValue }
  ) => {
    try {
      console.log(`[Budget API] 요청: ${params.year}년 ${params.month}월`);
      const budget = await budgetApi.getBudget(params.year, params.month);
      console.log("[Budget API] 응답:", budget);
      return budget;
    } catch (error) {
      console.error("[Budget API] 에러:", error);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          `예산 정보를 불러오지 못했습니다. (상태 코드: ${error.response?.status})`;
        console.error("[Budget API] 에러 메시지:", errorMessage);
        console.error("[Budget API] 에러 응답:", error.response?.data);
        return rejectWithValue(errorMessage);
      }

      console.error("[Budget API] 알 수 없는 에러:", error);
      return rejectWithValue(`알 수 없는 오류가 발생했습니다: ${error}`);
    }
  }
);

/**
 * 예산 사용 이력 조회 비동기 액션
 */
export const fetchBudgetUsageHistory = createAsyncThunk(
  "budget/fetchBudgetUsageHistory",
  async (budgetId: number, { rejectWithValue }) => {
    try {
      console.log(`[Budget Usage API] 요청: budgetId=${budgetId}`);
      const usageHistory = await budgetApi.getBudgetUsageHistory(budgetId);
      console.log("[Budget Usage API] 응답:", usageHistory);
      return usageHistory;
    } catch (error) {
      console.error("[Budget Usage API] 에러:", error);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          `예산 사용 이력을 불러오지 못했습니다. (상태 코드: ${error.response?.status})`;
        console.error("[Budget Usage API] 에러 메시지:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(`알 수 없는 오류가 발생했습니다: ${error}`);
    }
  }
);

/**
 * 예산 차감 비동기 액션
 */
export const deductBudget = createAsyncThunk(
  "budget/deductBudget",
  async (
    params: { budgetId: number; request: BudgetDeductRequest },
    { rejectWithValue }
  ) => {
    try {
      console.log(`[Budget Deduct API] 요청: budgetId=${params.budgetId}`, params.request);
      const usage = await budgetApi.deductBudget(params.budgetId, params.request);
      console.log("[Budget Deduct API] 응답:", usage);
      return usage;
    } catch (error) {
      console.error("[Budget Deduct API] 에러:", error);

      if (error instanceof AxiosError) {
        const errorMessage =
          (error.response?.data as ApiErrorResponse)?.message ||
          `예산 차감에 실패했습니다. (상태 코드: ${error.response?.status})`;
        console.error("[Budget Deduct API] 에러 메시지:", errorMessage);
        return rejectWithValue(errorMessage);
      }

      return rejectWithValue(`알 수 없는 오류가 발생했습니다: ${error}`);
    }
  }
);

/**
 * Budget 슬라이스
 */
const budgetSlice = createSlice({
  name: "budget",
  initialState,
  reducers: {
    /**
     * 에러 초기화
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Budget 상태 초기화
     */
    resetBudget: (state) => {
      state.departmentBudget = null;
      state.allBudgets = [];
      state.usageHistory = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 예산 조회
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.departmentBudget = action.payload;
        state.error = null;
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 예산 사용 이력 조회
    builder
      .addCase(fetchBudgetUsageHistory.pending, (state) => {
        state.usageHistoryLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetUsageHistory.fulfilled, (state, action) => {
        state.usageHistoryLoading = false;
        state.usageHistory = action.payload;
        state.error = null;
      })
      .addCase(fetchBudgetUsageHistory.rejected, (state, action) => {
        state.usageHistoryLoading = false;
        state.error = action.payload as string;
      });

    // 예산 차감
    builder
      .addCase(deductBudget.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deductBudget.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // 예산 정보 업데이트 (차감된 금액만큼 잔액 감소)
        if (state.departmentBudget) {
          state.departmentBudget.remainingAmount -= action.payload.amount;
        }

        // 사용 이력에 추가
        state.usageHistory.unshift(action.payload);
      })
      .addCase(deductBudget.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetBudget } = budgetSlice.actions;
export default budgetSlice.reducer;
