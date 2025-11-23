import { apiClient } from "./client";
import type {
  ChatRoom,
  CreateChatRoomRequest,
  JoinChatRoomRequest,
  ChatMessagePageResponse,
  ChatMessage,
} from "../../types/chat.types";

/**
 * Spring Boot Page 응답 타입
 */
interface SpringPageResponse<T> {
  content: T[];
  number: number;
  totalPages: number;
  totalElements: number;
  last: boolean;
}

/**
 * 채팅 관련 API 서비스
 */
export const chatApi = {
  /**
   * 채팅방 목록 조회
   * GET /api/chat/rooms
   */
  getChatRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get<ChatRoom[]>("/chat/rooms");
    // 백엔드에서 createdAt이 없는 경우 현재 시간으로 설정
    return response.data.map(room => ({
      ...room,
      createdAt: room.createdAt || new Date().toISOString(),
    }));
  },

  /**
   * 채팅방 생성
   * POST /api/chat/rooms
   */
  createChatRoom: async (
    request: CreateChatRoomRequest
  ): Promise<ChatRoom> => {
    const response = await apiClient.post<ChatRoom>("/chat/rooms", request);
    // 백엔드에서 createdAt이 없는 경우 현재 시간으로 설정
    return {
      ...response.data,
      createdAt: response.data.createdAt || new Date().toISOString(),
    };
  },

  /**
   * 채팅방 입장 (비밀번호 검증)
   * POST /api/chat/rooms/{roomId}/join
   */
  joinChatRoom: async (
    roomId: string,
    password?: string
  ): Promise<void> => {
    const body = password ? { password } : undefined;
    await apiClient.post(`/chat/rooms/${roomId}/join`, body);
  },

  /**
   * 채팅방 나가기
   * POST /api/chat/rooms/{roomId}/leave
   */
  leaveChatRoom: async (roomId: string): Promise<void> => {
    await apiClient.post(`/chat/rooms/${roomId}/leave`);
  },

  /**
   * 특정 채팅방의 메시지 조회 (페이징)
   * GET /api/chat/rooms/{roomId}/messages
   */
  getChatMessages: async (
    roomId: string,
    page: number = 0,
    size: number = 50
  ): Promise<ChatMessagePageResponse> => {
    // 백엔드는 Spring의 Page<ChatMessageResponse> 형태로 반환
    // sort=createdAt,asc로 오래된 메시지부터 가져오기
    const response = await apiClient.get<SpringPageResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages`,
      {
        params: {
          page,
          size,
          sort: 'createdAt,asc' // 오래된 메시지부터 (최신 메시지가 아래로)
        },
      }
    );

    // Spring Page 구조를 프론트엔드 형태로 변환
    return {
      messages: response.data.content || [],
      currentPage: response.data.number || 0,
      totalPages: response.data.totalPages || 0,
      totalElements: response.data.totalElements || 0,
      hasNext: !response.data.last,
    };
  },
};

// 하위 호환성을 위한 개별 함수 export
export const getChatRooms = chatApi.getChatRooms;
export const createChatRoom = chatApi.createChatRoom;
export const joinChatRoom = (request: JoinChatRoomRequest) =>
  chatApi.joinChatRoom(request.roomId, request.password);
export const leaveChatRoom = chatApi.leaveChatRoom;
export const getChatMessages = chatApi.getChatMessages;
