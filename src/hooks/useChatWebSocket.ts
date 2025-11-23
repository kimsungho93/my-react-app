import { useEffect, useRef, useCallback, useState } from "react";
import {
  getChatWebSocketClient,
  ConnectionStatus,
  type MessageCallback,
} from "../services/websocket/chatWebSocket";
import type { ChatMessage, MessageType } from "../types/chat.types";
import { useAppSelector } from "./useRedux";

/**
 * 채팅 WebSocket 커스텀 훅
 * @param roomId - 채팅방 ID (null이면 연결하지 않음)
 * @param onMessage - 메시지 수신 콜백
 * @param autoConnect - 자동 연결 여부 (기본: true)
 */
export const useChatWebSocket = (
  roomId: string | null,
  onMessage?: MessageCallback,
  autoConnect = true
) => {
  const clientRef = useRef(getChatWebSocketClient());
  const currentUser = useAppSelector((state) => state.auth.user);
  const [status, setStatus] = useState<ConnectionStatus>(
    clientRef.current.getStatus()
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const hasEnteredRef = useRef(false); // 입장 여부 추적
  const previousRoomIdRef = useRef<string | null>(null); // 이전 roomId 추적
  const isLeavingRef = useRef(false); // 퇴장 중인지 여부 (cleanup 시작 시점 추적)

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    (content: string, type: MessageType = "TEXT" as MessageType) => {
      if (roomId && currentUser) {
        clientRef.current.sendMessage(
          roomId,
          content,
          type,
          currentUser.id,   // userId
          currentUser.name  // userName
        );
      }
    },
    [roomId, currentUser]
  );

  /**
   * 채팅방 입장
   */
  const enterRoom = useCallback(() => {
    if (roomId && currentUser) {
      clientRef.current.enterRoom(roomId, currentUser.id, currentUser.name);
    }
  }, [roomId, currentUser]);

  /**
   * 채팅방 퇴장
   */
  const leaveRoom = useCallback(() => {
    if (roomId && currentUser) {
      clientRef.current.leaveRoom(roomId, currentUser.id, currentUser.name);
    }
  }, [roomId, currentUser]);

  /**
   * 연결
   */
  const connect = useCallback(() => {
    clientRef.current.connect();
  }, []);

  /**
   * 연결 해제
   */
  const disconnect = useCallback(() => {
    clientRef.current.disconnect();
  }, []);

  /**
   * WebSocket 연결 및 채팅방 구독 설정
   */
  useEffect(() => {
    const client = clientRef.current;

    // 상태 변경 콜백 등록
    const unsubscribeStatus = client.onStatusChange(setStatus);

    // 자동 연결
    if (autoConnect && status === ConnectionStatus.DISCONNECTED) {
      client.connect();
    }

    return () => {
      unsubscribeStatus();
    };
  }, [autoConnect, status]);

  /**
   * 채팅방 구독 및 입장/퇴장 처리
   * roomId 변경 시에만 실행
   */
  useEffect(() => {
    const client = clientRef.current;

    // roomId가 없으면 종료
    if (!roomId) {
      return;
    }

    // roomId가 변경된 경우 (다른 방으로 이동)
    const isRoomChanged = roomId !== previousRoomIdRef.current;

    if (isRoomChanged && previousRoomIdRef.current) {
      // 이전 방에서 퇴장 (입장했었고 아직 퇴장 중이 아닌 경우에만)
      if (hasEnteredRef.current && currentUser && !isLeavingRef.current) {
        client.leaveRoom(previousRoomIdRef.current, currentUser.id, currentUser.name);
      }
    }

    // 새 방으로 상태 초기화
    hasEnteredRef.current = false;
    isLeavingRef.current = false;
    previousRoomIdRef.current = roomId;

    // 입장 처리 함수
    const enterRoomIfReady = () => {
      // 이미 입장했거나 퇴장 중이면 무시
      if (hasEnteredRef.current || isLeavingRef.current) {
        return;
      }

      const currentStatus = client.getStatus();

      if (currentStatus === ConnectionStatus.CONNECTED && currentUser && roomId) {
        // 채팅방 구독
        client.subscribeToRoom(roomId);

        // 입장 알림 전송
        client.enterRoom(roomId, currentUser.id, currentUser.name);
        hasEnteredRef.current = true;
      }
    };

    // WebSocket 상태 변경 리스너 등록
    const unsubscribeStatus = client.onStatusChange((newStatus) => {
      if (newStatus === ConnectionStatus.CONNECTED) {
        enterRoomIfReady();
      }
    });

    // 초기 입장 시도 (이미 연결된 경우)
    enterRoomIfReady();

    // cleanup 함수: 컴포넌트 언마운트 또는 roomId 변경 시 실행
    return () => {
      // 입장했었고 아직 퇴장하지 않은 경우에만 퇴장 메시지 전송
      if (hasEnteredRef.current && roomId && currentUser && !isLeavingRef.current) {
        client.leaveRoom(roomId, currentUser.id, currentUser.name);
        isLeavingRef.current = true;
      }

      // 구독 해제
      client.unsubscribeFromRoom();
      unsubscribeStatus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // roomId만 의존성 배열에 포함

  /**
   * 브라우저 닫기/새로고침 시 퇴장 처리
   * beforeunload 이벤트 활용 + Beacon API로 확실한 전송 보장
   */
  /**
   * 브라우저 닫기/새로고침 시 퇴장 처리
   * [FIX] beforeunload 이벤트 제거
   * Beacon API로 퇴장 메시지를 보내면, 새로고침 후 재입장(ENTER) 메시지와 경합(Race Condition)이 발생하여
   * "입장 -> 퇴장" 순서로 메시지가 보이는 문제가 발생함.
   * 따라서 명시적인 퇴장 메시지 전송을 제거하고, 서버의 WebSocket 연결 끊김 감지에 의존하도록 변경.
   */
  /*
  useEffect(() => {
    const handleBeforeUnload = () => {
      // ... (Removed to prevent race condition)
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  */

  /**
   * 메시지 수신 콜백 등록
   */
  useEffect(() => {
    const client = clientRef.current;

    const handleMessage: MessageCallback = (message) => {
      // 백엔드에서 id나 createdAt을 제공하지 않는 경우 생성
      const messageWithDefaults: ChatMessage = {
        ...message,
        id: message.id || `temp-${Date.now()}-${Math.random()}`,
        createdAt: message.createdAt || new Date().toISOString(),
      };

      // 외부 콜백이 있으면 외부에서 처리하도록 위임
      if (onMessage) {
        onMessage(messageWithDefaults);
      } else {
        // 외부 콜백이 없는 경우에만 내부 상태에 추가
        setMessages((prev) => [...prev, messageWithDefaults]);
      }
    };

    const unsubscribeMessage = client.onMessage(handleMessage);

    return () => {
      unsubscribeMessage();
    };
  }, [onMessage]);

  return {
    // 상태
    status,
    messages,
    isConnected: status === ConnectionStatus.CONNECTED,
    isConnecting: status === ConnectionStatus.CONNECTING,

    // 메서드
    sendMessage,
    enterRoom,
    leaveRoom,
    connect,
    disconnect,

    // 메시지 초기화 (페이지 전환 시 등)
    clearMessages: () => setMessages([]),
  };
};
