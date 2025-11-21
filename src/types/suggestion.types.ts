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
 * 파일은 FormData의 files 필드로 별도 전송
 */
export interface CreateSuggestionRequest {
  title: string;
  content: string;
  category: SuggestionCategory;
  name: string;
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
  attachments: FileMetadataResponse[];
  createdAt: string;
  updatedAt?: string;
  status: SuggestionStatus;
  adminComment?: string;
}

/**
 * 파일 업로드 응답
 */
export interface FileUploadResponse {
  fileName: string;
  fileUrl: string;
}

/**
 * 파일 메타데이터 응답
 */
export interface FileMetadataResponse {
  originalFileName: string;
  storedFileName: string;
  fileUrl: string;
  fileSize: number;
}

/**
 * 페이징 정렬 정보
 */
export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

/**
 * 페이징 정보
 */
export interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * 페이징된 응답
 */
export interface PageResponse<T> {
  content: T[];
  pageable: Pageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: Sort;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

/**
 * 건의사항 상태 타입
 */
export type SuggestionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "REJECTED";

/**
 * 건의사항 상태 업데이트 요청
 */
export interface UpdateSuggestionStatusRequest {
  status: SuggestionStatus;
  adminComment?: string;
}
