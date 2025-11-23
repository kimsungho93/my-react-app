/**
 * 채팅방 정보 타입
 */
export interface ChatRoom {
  /** 채팅방 ID */
  id: string;
  /** 채팅방 이름 */
  name: string;
  /** 비밀번호 설정 여부 */
  hasPassword: boolean;
  /** 채팅방 생성자 이름 */
  creatorName: string;
  /** 현재 참여 인원 수 */
  currentParticipants: number;
  /** 최대 참여 인원 수 */
  maxParticipants: number;
  /** 생성 일시 */
  createdAt: string;
}

/**
 * 채팅방 생성 요청 DTO
 */
export interface CreateChatRoomRequest {
  /** 채팅방 이름 */
  name: string;
  /** 비밀번호 (선택, 4~10자리) */
  password?: string;
  /** 최대 참여 인원 수 (2~15명) */
  maxParticipants: number;
}

/**
 * 채팅방 입장 요청 DTO
 */
export interface JoinChatRoomRequest {
  /** 채팅방 ID */
  roomId: string;
  /** 비밀번호 (비밀번호가 있는 방인 경우) */
  password?: string;
}

/**
 * 채팅방 입장 응답 DTO
 */
export interface JoinChatRoomResponse {
  /** 입장 성공 여부 */
  success: boolean;
  /** 에러 메시지 (실패 시) */
  message?: string;
  /** 채팅방 ID */
  roomId?: string;
}

/**
 * 채팅 메시지 타입
 */
export const MessageType = {
  TEXT: "TEXT",
  ENTER: "ENTER",
  LEAVE: "LEAVE",
  IMAGE: "IMAGE",
  FILE: "FILE",
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

/**
 * 채팅 메시지 전송 요청 DTO
 */
export interface SendChatMessageRequest {
  /** 메시지 내용 */
  content: string;
  /** 메시지 타입 */
  type?: MessageType;
}

/**
 * 채팅 메시지 응답 DTO
 * 백엔드: ChatMessageResponse
 */
export interface ChatMessage {
  /** 메시지 ID (입장/퇴장 메시지는 null일 수 있음) */
  id?: string;
  /** 채팅방 ID */
  roomId: string;
  /** 발신자 ID (백엔드: Long, 입장/퇴장 메시지는 null일 수 있음) */
  senderId?: number | string | null;
  /** 발신자 이름 */
  senderName: string;
  /** 메시지 내용 */
  content: string;
  /** 메시지 타입 (TEXT, ENTER, LEAVE, IMAGE, FILE) */
  type: MessageType;
  /** 전송 시간 (ISO 8601, 입장/퇴장 메시지는 null일 수 있음) */
  createdAt?: string;
}

/**
 * 메시지 페이징 응답 DTO
 */
export interface ChatMessagePageResponse {
  /** 메시지 목록 */
  messages: ChatMessage[];
  /** 현재 페이지 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 전체 메시지 수 */
  totalElements: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
}

/**
 * 사용자 입장 요청 (WebSocket)
 */
export interface UserEnterRequest {
  roomId: string;
}

/**
 * 사용자 퇴장 요청 (WebSocket)
 */
export interface UserLeaveRequest {
  roomId: string;
}
