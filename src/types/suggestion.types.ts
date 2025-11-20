/**
 * 건의하기 관련 타입 정의
 */

/**
 * 건의 카테고리
 */
export const SuggestionCategory = {
  SYSTEM: "SYSTEM",
  UI: "UI",
  BUG: "BUG",
  ETC: "ETC",
} as const;

export type SuggestionCategory = typeof SuggestionCategory[keyof typeof SuggestionCategory];

/**
 * 건의 카테고리 라벨 매핑
 */
export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  SYSTEM: "시스템",
  UI: "UI/UX",
  BUG: "버그",
  ETC: "기타",
};

/**
 * 건의사항 생성 요청
 */
export interface CreateSuggestionRequest {
  title: string;
  content: string;
  category: SuggestionCategory;
  name: string;
  attachments?: string[];
}

/**
 * 건의사항 응답
 */
export interface Suggestion {
  id: number;
  title: string;
  content: string;
  category: SuggestionCategory;
  name: string;
  attachments: string[];
  createdAt: string;
  updatedAt?: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";
}

/**
 * 파일 업로드 응답
 */
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
}
