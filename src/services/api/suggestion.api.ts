import { apiClient } from "./client";
import type {
  CreateSuggestionRequest,
  Suggestion,
  FileUploadResponse,
  PageResponse,
  UpdateSuggestionStatusRequest,
} from "../../types/suggestion.types";

/**
 * 건의사항 API 서비스
 */
export const suggestionApi = {
  /**
   * 건의사항 생성 (파일 포함)
   */
  createSuggestion: async (
    data: CreateSuggestionRequest,
    files: File[]
  ): Promise<Suggestion> => {
    const formData = new FormData();

    // 텍스트 데이터 추가
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("category", data.category);
    formData.append("name", data.name);

    // 파일 추가
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<Suggestion>("/suggestions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * 파일 업로드 (여러 파일 한 번에)
   */
  uploadFiles: async (files: File[]): Promise<FileUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await apiClient.post<FileUploadResponse[]>(
      "/files",
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
   * 파일 삭제 (롤백용)
   */
  deleteFiles: async (fileNames: string[]): Promise<void> => {
    await apiClient.delete("/files", {
      data: fileNames,
    });
  },

  /**
   * 건의사항 목록 조회
   * @param page 페이지 번호 (0부터 시작)
   * @param size 페이지 크기 (기본값: 20)
   */
  getSuggestions: async (
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<Suggestion>> => {
    const response = await apiClient.get<PageResponse<Suggestion>>(
      "/suggestions",
      {
        params: { page, size },
      }
    );
    return response.data;
  },

  /**
   * 건의사항 상세 조회 (추후 확장)
   */
  getSuggestionById: async (id: number): Promise<Suggestion> => {
    const response = await apiClient.get<Suggestion>(`/suggestions/${id}`);
    return response.data;
  },

  /**
   * 파일 다운로드
   * @param storedFileName 서버에 저장된 파일명
   * @returns Blob 데이터
   */
  downloadFile: async (storedFileName: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(
      `/files/download/${encodeURIComponent(storedFileName)}`,
      {
        responseType: "blob", // Blob으로 응답 받기
      }
    );
    return response.data;
  },

  /**
   * 건의사항 상태 업데이트 (관리자 전용)
   * @param id 건의사항 ID
   * @param data 상태 및 관리자 코멘트
   */
  updateSuggestionStatus: async (
    id: number,
    data: UpdateSuggestionStatusRequest
  ): Promise<Suggestion> => {
    const response = await apiClient.patch<Suggestion>(
      `/suggestions/${id}`,
      data
    );
    return response.data;
  },
};
