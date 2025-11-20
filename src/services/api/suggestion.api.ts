import { apiClient } from "./client";
import type {
  CreateSuggestionRequest,
  Suggestion,
  FileUploadResponse,
} from "../../types/suggestion.types";

/**
 * 건의사항 API 서비스
 */
export const suggestionApi = {
  /**
   * 건의사항 생성
   */
  createSuggestion: async (
    data: CreateSuggestionRequest
  ): Promise<Suggestion> => {
    const response = await apiClient.post<Suggestion>("/suggestions", data);
    return response.data;
  },

  /**
   * 파일 업로드
   */
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<FileUploadResponse>(
      "/suggestions/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  /**
   * 건의사항 목록 조회 (추후 확장)
   */
  getSuggestions: async (): Promise<Suggestion[]> => {
    const response = await apiClient.get<Suggestion[]>("/suggestions");
    return response.data;
  },

  /**
   * 건의사항 상세 조회 (추후 확장)
   */
  getSuggestionById: async (id: number): Promise<Suggestion> => {
    const response = await apiClient.get<Suggestion>(`/suggestions/${id}`);
    return response.data;
  },
};
