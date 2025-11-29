/**
 * 투표 관련 타입 정의
 */

/**
 * 투표 상태
 */
export const VoteStatus = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
} as const;

export type VoteStatus = (typeof VoteStatus)[keyof typeof VoteStatus];

/**
 * 투표 상태 라벨
 */
export const VOTE_STATUS_LABELS: Record<VoteStatus, string> = {
  ACTIVE: "진행중",
  CLOSED: "종료됨",
};

/**
 * 투표 작성자 정보
 */
export interface VoteAuthor {
  id: number;
  name: string;
  profileImage?: string; // 백엔드 응답 필드명 (레거시)
  profileImageUrl?: string; // R2 버킷의 프로필 이미지 URL (Presigned URL로 변환 필요)
}

/**
 * 투표 항목
 */
export interface VoteOption {
  id: number;
  text: string;
  voteCount: number;
  voters: VoteParticipant[];
  displayOrder?: number; // 선택지 순서
  addedByUserId?: number; // 사용자가 추가한 선택지인 경우
}

/**
 * 투표 참여자 정보
 */
export interface VoteParticipant {
  id: number;
  name: string;
  votedAt: string;
  profileImage?: string; // 백엔드 응답 필드명 (레거시)
  profileImageUrl?: string; // R2 버킷의 프로필 이미지 URL (Presigned URL로 변환 필요)
}

/**
 * 투표 정보
 */
export interface Vote {
  id: number;
  title: string;
  description?: string;
  author: VoteAuthor;
  options: VoteOption[];
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  allowAddOption: boolean; // 선택지 추가 허용 여부
  /** Jackson이 is 접두사를 제거할 수 있어서 둘 다 지원 */
  anonymous?: boolean;
  multipleChoice?: boolean;
  totalParticipants: number;
  totalActiveMembers?: number;
  endDate: string;
  status: VoteStatus;
  createdAt: string;
  updatedAt?: string;
  myVotedOptionIds?: number[];
}

/**
 * 활성 회원 수 응답
 */
export interface ActiveMemberCountResponse {
  activecount: number;
}

/**
 * 투표 목록 아이템 (간략 정보)
 */
export interface VoteListItem {
  id: number;
  title: string;
  author: VoteAuthor;
  anonymous: boolean;
  multipleChoice: boolean;
  totalParticipants: number;
  totalActiveMembers?: number;
  optionCount: number;
  endDate: string;
  status: VoteStatus;
  createdAt: string;
  hasVoted: boolean;
}

/**
 * 투표 생성 요청
 */
export interface CreateVoteRequest {
  title: string;
  description?: string;
  options: string[];
  isAnonymous: boolean;
  isMultipleChoice: boolean;
  allowAddOption: boolean; // 선택지 추가 허용 여부
  endDate: string;
}

/**
 * 선택지 추가 요청
 */
export interface AddVoteOptionRequest {
  text: string;
}

/**
 * 선택지 추가 응답
 */
export interface AddVoteOptionResponse {
  id: number;
  text: string;
  voteCount: number;
  displayOrder: number;
  addedByUserId: number;
}

/**
 * 투표 선택지 수정 정보
 */
export interface UpdateVoteOption {
  id?: number; // 기존 선택지인 경우 id 포함
  text: string;
  displayOrder: number; // 선택지 순서 (백엔드 필드명: displayOrder)
}

/**
 * 투표 수정 요청
 */
export interface UpdateVoteRequest {
  title: string;
  description?: string;
  endDate: string;
  options?: UpdateVoteOption[]; // 선택지 수정 정보 (선택적)
  deletedOptionIds?: number[]; // 삭제할 선택지 ID 목록 (선택적)
}

/**
 * 투표 참여 요청
 */
export interface CastVoteRequest {
  optionIds: number[];
}

/**
 * 페이징 응답
 */
export interface VotePageResponse {
  content: VoteListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
