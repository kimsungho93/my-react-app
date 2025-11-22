import type { ChatRoom, CreateChatRoomRequest, JoinChatRoomRequest } from '../../types/chat.types';

/**
 * Mock 채팅방 데이터
 */
const mockChatRooms: ChatRoom[] = [
  {
    id: '1',
    name: '자유 채팅방',
    hasPassword: false,
    creatorName: '홍길동',
    currentParticipants: 5,
    maxParticipants: 10,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
  },
  {
    id: '2',
    name: '비밀 채팅방',
    hasPassword: true,
    creatorName: '김철수',
    currentParticipants: 3,
    maxParticipants: 8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
  },
  {
    id: '3',
    name: '프로젝트 논의',
    hasPassword: true,
    creatorName: '이영희',
    currentParticipants: 7,
    maxParticipants: 15,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
  },
  {
    id: '4',
    name: '게임 파티',
    hasPassword: false,
    creatorName: '박민수',
    currentParticipants: 2,
    maxParticipants: 5,
    createdAt: new Date(Date.now() - 30 * 1000).toISOString(), // 30초 전 (방금 전)
  },
  {
    id: '5',
    name: '스터디 그룹',
    hasPassword: true,
    creatorName: '정수진',
    currentParticipants: 10,
    maxParticipants: 12,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2주 전
  },
  {
    id: '6',
    name: '리액트와타입스크립트를활용한웹개발스터디모임',
    hasPassword: false,
    creatorName: '최개발',
    currentParticipants: 8,
    maxParticipants: 15,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45분 전
  },
];

/**
 * 채팅방 목록 조회 API (Mock)
 */
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  // 실제 API 호출을 시뮬레이션하기 위한 딜레이
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [...mockChatRooms];
};

/**
 * 채팅방 생성 API (Mock)
 */
export const createChatRoom = async (
  request: CreateChatRoomRequest
): Promise<ChatRoom> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newRoom: ChatRoom = {
    id: String(mockChatRooms.length + 1),
    name: request.name,
    hasPassword: !!request.password,
    creatorName: '현재 사용자', // TODO: 실제 사용자 정보로 대체
    currentParticipants: 1,
    maxParticipants: request.maxParticipants,
    createdAt: new Date().toISOString(),
  };

  mockChatRooms.push(newRoom);
  return newRoom;
};

/**
 * 채팅방 입장 API (Mock)
 */
export const joinChatRoom = async (
  request: JoinChatRoomRequest
): Promise<{ success: boolean; message?: string }> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const room = mockChatRooms.find((r) => r.id === request.roomId);

  if (!room) {
    return { success: false, message: '채팅방을 찾을 수 없습니다.' };
  }

  if (room.currentParticipants >= room.maxParticipants) {
    return { success: false, message: '채팅방이 가득 찼습니다.' };
  }

  // 실제로는 비밀번호 검증이 필요
  if (room.hasPassword && !request.password) {
    return { success: false, message: '비밀번호가 필요합니다.' };
  }

  // Mock: 입장 성공 시 참여 인원 증가
  room.currentParticipants += 1;

  return { success: true };
};
