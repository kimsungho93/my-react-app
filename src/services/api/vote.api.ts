import { apiClient } from "./client";
import type {
  Vote,
  VotePageResponse,
  CreateVoteRequest,
  UpdateVoteRequest,
  CastVoteRequest,
  AddVoteOptionRequest,
  AddVoteOptionResponse,
} from "../../types/vote.types";

/**
 * 백엔드 공통 응답 타입
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * 투표 API 서비스
 */
export const voteApi = {
  /**
   * 투표 목록 조회
   * @param params 페이징 및 필터 파라미터
   */
  getVotes: async (params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ data: VotePageResponse }> => {
    const response = await apiClient.get<ApiResponse<VotePageResponse>>("/votes", {
      params: {
        page: params?.page ?? 0,
        size: params?.size ?? 10,
        ...(params?.status && params.status !== "all" && { status: params.status }),
      },
    });
    return { data: response.data.data };
  },

  /**
   * 투표 상세 조회
   * @param id 투표 ID
   */
  getVoteDetail: async (id: number): Promise<{ data: Vote }> => {
    const response = await apiClient.get<ApiResponse<Vote>>(`/votes/${id}`);
    return { data: response.data.data };
  },

  /**
   * 투표 생성
   * @param request 투표 생성 요청 데이터
   */
  createVote: async (request: CreateVoteRequest): Promise<{ data: Vote }> => {
    const response = await apiClient.post<ApiResponse<Vote>>("/votes", request);
    return { data: response.data.data };
  },

  /**
   * 투표 수정
   * @param id 투표 ID
   * @param request 투표 수정 요청 데이터
   */
  updateVote: async (
    id: number,
    request: UpdateVoteRequest
  ): Promise<{ data: Vote }> => {
    const response = await apiClient.put<ApiResponse<Vote>>(`/votes/${id}`, request);
    return { data: response.data.data };
  },

  /**
   * 투표 삭제
   * @param id 투표 ID
   */
  deleteVote: async (id: number): Promise<{ data: { deleted: boolean } }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean }>>(`/votes/${id}`);
    return { data: response.data.data };
  },

  /**
   * 투표 참여
   * @param voteId 투표 ID
   * @param request 투표 참여 요청 데이터
   */
  castVote: async (
    voteId: number,
    request: CastVoteRequest
  ): Promise<{ data: Vote }> => {
    const response = await apiClient.post<ApiResponse<Vote>>(`/votes/${voteId}/cast`, request);
    return { data: response.data.data };
  },

  /**
   * 투표 종료
   * @param id 투표 ID
   */
  closeVote: async (id: number): Promise<{ data: Vote }> => {
    const response = await apiClient.post<ApiResponse<Vote>>(`/votes/${id}/close`);
    return { data: response.data.data };
  },

  /**
   * 투표 선택지 추가
   * @param voteId 투표 ID
   * @param request 선택지 추가 요청 데이터
   */
  addVoteOption: async (
    voteId: number,
    request: AddVoteOptionRequest
  ): Promise<{ data: AddVoteOptionResponse }> => {
    const response = await apiClient.post<ApiResponse<AddVoteOptionResponse>>(
      `/votes/${voteId}/options`,
      request
    );
    return { data: response.data.data };
  },
};
