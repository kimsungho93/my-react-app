/**
 * 공지사항 타입
 */
export interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: "high" | "normal" | "low";
}

/**
 * 부서 예산 타입 (백엔드 BudgetResponse)
 */
export interface DepartmentBudget {
  budgetId: number;
  year: number;
  month: number;
  totalAmount: number;
  remainingAmount: number;
}

/**
 * 예산 사용 이력 타입 (백엔드 BudgetUsageResponse)
 */
export interface BudgetUsage {
  usageId: number;
  budgetId: number;
  amount: number;
  reason: string;
  usageDate: string;
  createdAt: string;
}

/**
 * 예산 차감 요청 타입 (백엔드 BudgetDeductRequest)
 */
export interface BudgetDeductRequest {
  amount: number;
  reason: string;
  usageDate: string; // ISO 8601 형식 (YYYY-MM-DD)
}

/**
 * 캘린더 이벤트 타입
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: {
    type: "meeting" | "vacation" | "deadline" | "etc";
    description?: string;
  };
}

/**
 * 대시보드 상태 타입
 */
export interface DashboardState {
  notices: Notice[];
  departmentBudget: DepartmentBudget | null;
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}
