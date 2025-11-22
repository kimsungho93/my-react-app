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
