import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import type {
  ChatMessage,
  MessageType,
} from "../../types/chat.types";

/**
 * WebSocket 연결 상태
 */
export const ConnectionStatus = {
  CONNECTING: "CONNECTING",
  CONNECTED: "CONNECTED",
  DISCONNECTED: "DISCONNECTED",
  ERROR: "ERROR",
} as const;

export type ConnectionStatus = typeof ConnectionStatus[keyof typeof ConnectionStatus];

/**
 * 메시지 수신 콜백 타입
 */
export type MessageCallback = (message: ChatMessage) => void;

/**
 * 연결 상태 변경 콜백 타입
 */
export type StatusCallback = (status: ConnectionStatus) => void;

/**
 * 채팅 WebSocket 클라이언트 클래스
 * STOMP over SockJS를 사용한 실시간 채팅 통신
 */
export class ChatWebSocketClient {
  private client: Client | null = null;
  private subscription: ReturnType<Client['subscribe']> | null = null;
  private currentRoomId: string | null = null;
  private messageCallbacks: Set<MessageCallback> = new Set();
  private statusCallbacks: Set<StatusCallback> = new Set();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 3000; // 3초
  private baseUrl: string;
  private lastEnterKey: string | null = null; // 마지막 입장 키 (roomId:userId 조합)
  private lastLeaveKey: string | null = null; // 마지막 퇴장 키 (roomId:userId 조합)
  private lastEnterTime = 0; // 마지막 입장 시간 (디바운스용)
  private lastLeaveTime = 0; // 마지막 퇴장 시간 (디바운스용)

  /**
   * WebSocket 클라이언트 생성자
   * @param baseUrl - WebSocket 서버 URL (기본값: 환경변수)
   */
  constructor(baseUrl?: string) {
    // 개발 환경에서는 Vite 프록시 사용 (상대 경로)
    if (import.meta.env.DEV) {
      this.baseUrl = "";  // 상대 경로 사용 (Vite 프록시를 통해 /ws -> http://localhost:8080/ws)
    } else {
      // 프로덕션 환경에서는 절대 경로 사용
      const apiUrl = baseUrl || import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      this.baseUrl = apiUrl.replace("/api", "");
    }
  }

  /**
   * WebSocket 연결 초기화
   */
  public connect(): void {
    if (this.client?.connected) {
      console.warn("WebSocket is already connected");
      return;
    }

    this.updateStatus(ConnectionStatus.CONNECTING);

    this.client = new Client({
      // SockJS를 통한 WebSocket 연결
      webSocketFactory: () => new SockJS(`${this.baseUrl}/ws/chat`) as WebSocket,

      // 연결 성공 콜백
      onConnect: () => {
        this.reconnectAttempts = 0;
        this.updateStatus(ConnectionStatus.CONNECTED);
      },

      // 연결 해제 콜백
      onDisconnect: () => {
        this.updateStatus(ConnectionStatus.DISCONNECTED);
        this.subscription = null;
      },

      // 에러 콜백
      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"], frame.body);
        this.updateStatus(ConnectionStatus.ERROR);
        this.handleReconnect();
      },

      // WebSocket 에러 콜백
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
        this.updateStatus(ConnectionStatus.ERROR);
      },

      // 디버그 로그 비활성화
      debug: () => {},

      // 하트비트 설정 (30초마다)
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,

      // 재연결 설정
      reconnectDelay: this.reconnectDelay,
    });

    this.client.activate();
  }

  /**
   * 특정 채팅방 구독
   * @param roomId - 채팅방 ID
   */
  public subscribeToRoom(roomId: string): void {
    if (!this.client?.connected) {
      console.error("WebSocket is not connected. Call connect() first.");
      return;
    }

    // 이전 구독 해제
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // 새 채팅방 구독
    this.subscription = this.client.subscribe(
      `/topic/chat/${roomId}`,
      (message) => {
        try {
          const chatMessage: ChatMessage = JSON.parse(message.body);
          this.notifyMessageCallbacks(chatMessage);
        } catch (error) {
          console.error("Failed to parse message:", error);
        }
      }
    );

    this.currentRoomId = roomId;
  }

  /**
   * 채팅방 구독 해제
   */
  public unsubscribeFromRoom(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this.currentRoomId = null;
    }
  }

  /**
   * 채팅 메시지 전송
   * @param roomId - 채팅방 ID
   * @param content - 메시지 내용
   * @param type - 메시지 타입 (기본: TEXT)
   * @param userId - 사용자 ID (옵션)
   * @param userName - 사용자 이름 (옵션)
   */
  public sendMessage(
    roomId: string,
    content: string,
    type: MessageType = "TEXT" as MessageType,
    userId?: string,
    userName?: string
  ): void {
    if (!this.client?.connected) {
      console.error("Cannot send message: WebSocket is not connected");
      return;
    }

    const message = {
      roomId,
      content,
      type,
      senderId: userId,
      senderName: userName,
    };

    this.client.publish({
      destination: `/app/chat.send`,
      body: JSON.stringify(message),
    });
  }

  private pendingLeaveTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingLeaveKey: string | null = null;

  /**
   * 사용자 입장 알림
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID (옵션)
   * @param userName - 사용자 이름 (옵션)
   */
  public enterRoom(roomId: string, userId?: string, userName?: string): void {
    if (!this.client?.connected) {
      console.error("Cannot enter room: WebSocket is not connected");
      return;
    }

    const enterKey = `${roomId}:${userId || 'unknown'}`;

    // [FIX] Pending Leave 체크 (React StrictMode 등 빠른 재입장 시)
    // 퇴장 대기 중인 상태에서 다시 입장을 시도하면, 퇴장을 취소하고 입장도 생략(이미 입장 상태 유지)
    if (this.pendingLeaveKey === enterKey && this.pendingLeaveTimer) {
      clearTimeout(this.pendingLeaveTimer);
      this.pendingLeaveTimer = null;
      this.pendingLeaveKey = null;
      return;
    }

    const now = Date.now();
    const timeSinceLastEnter = now - this.lastEnterTime;

    // 중복 방지: 같은 방/같은 사용자가 500ms 이내에 다시 입장하려고 하면 무시
    if (this.lastEnterKey === enterKey && timeSinceLastEnter < 500) {
      return;
    }

    this.client.publish({
      destination: `/app/chat.enter`,
      body: JSON.stringify({
        roomId,
        senderId: userId,
        senderName: userName,
      }),
    });

    this.lastEnterKey = enterKey;
    this.lastEnterTime = now;
  }

  /**
   * 사용자 퇴장 알림
   * @param roomId - 채팅방 ID
   * @param userId - 사용자 ID (옵션)
   * @param userName - 사용자 이름 (옵션)
   */
  public leaveRoom(roomId: string, userId?: string, userName?: string): void {
    if (!this.client?.connected) {
      console.error("Cannot leave room: WebSocket is not connected");
      return;
    }

    const leaveKey = `${roomId}:${userId || 'unknown'}`;

    // [FIX] 퇴장 메시지 지연 전송 (Debounce)
    // React StrictMode 등으로 인한 빠른 Unmount/Mount 시 불필요한 퇴장/입장 메시지 방지
    if (this.pendingLeaveTimer) {
      clearTimeout(this.pendingLeaveTimer);
    }

    this.pendingLeaveKey = leaveKey;
    this.pendingLeaveTimer = setTimeout(() => {
      this.executeLeaveRoom(roomId, userId, userName);
      this.pendingLeaveTimer = null;
      this.pendingLeaveKey = null;
    }, 200); // 200ms 지연
  }

  /**
   * 실제 퇴장 메시지 전송 (내부용)
   */
  private executeLeaveRoom(roomId: string, userId?: string, userName?: string): void {
    if (!this.client?.connected) return;

    const now = Date.now();
    const timeSinceLastLeave = now - this.lastLeaveTime;
    const leaveKey = `${roomId}:${userId || 'unknown'}`;

    // 중복 방지: 같은 방/같은 사용자가 500ms 이내에 다시 퇴장하려고 하면 무시
    if (this.lastLeaveKey === leaveKey && timeSinceLastLeave < 500) {
      return;
    }

    this.client.publish({
      destination: `/app/chat.leave`,
      body: JSON.stringify({
        roomId,
        senderId: userId,
        senderName: userName,
      }),
    });

    this.lastLeaveKey = leaveKey;
    this.lastLeaveTime = now;
  }

  /**
   * WebSocket 연결 해제
   */
  public disconnect(): void {
    if (this.currentRoomId) {
      this.leaveRoom(this.currentRoomId);
    }

    this.unsubscribeFromRoom();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.updateStatus(ConnectionStatus.DISCONNECTED);
  }

  /**
   * 메시지 수신 콜백 등록
   * @param callback - 메시지 수신 시 호출될 함수
   */
  public onMessage(callback: MessageCallback): () => void {
    this.messageCallbacks.add(callback);
    // 구독 해제 함수 반환
    return () => this.messageCallbacks.delete(callback);
  }

  /**
   * 연결 상태 변경 콜백 등록
   * @param callback - 상태 변경 시 호출될 함수
   */
  public onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback);
    // 구독 해제 함수 반환
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * 현재 연결 상태 조회
   */
  public getStatus(): ConnectionStatus {
    if (!this.client) return ConnectionStatus.DISCONNECTED;
    if (this.client.connected) return ConnectionStatus.CONNECTED;
    if (this.client.active) return ConnectionStatus.CONNECTING;
    return ConnectionStatus.DISCONNECTED;
  }

  /**
   * 현재 구독 중인 채팅방 ID 조회
   */
  public getCurrentRoomId(): string | null {
    return this.currentRoomId;
  }

  /**
   * 메시지 콜백들에게 알림
   */
  private notifyMessageCallbacks(message: ChatMessage): void {
    this.messageCallbacks.forEach((callback) => {
      try {
        callback(message);
      } catch (error) {
        console.error("Error in message callback:", error);
      }
    });
  }

  /**
   * 상태 변경 콜백들에게 알림
   */
  private updateStatus(status: ConnectionStatus): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(status);
      } catch (error) {
        console.error("Error in status callback:", error);
      }
    });
  }

  /**
   * 재연결 시도
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      this.updateStatus(ConnectionStatus.ERROR);
    }
  }
}

/**
 * 싱글톤 WebSocket 클라이언트 인스턴스
 */
let chatWebSocketInstance: ChatWebSocketClient | null = null;

/**
 * WebSocket 클라이언트 싱글톤 인스턴스 가져오기
 */
export const getChatWebSocketClient = (): ChatWebSocketClient => {
  if (!chatWebSocketInstance) {
    chatWebSocketInstance = new ChatWebSocketClient();
  }
  return chatWebSocketInstance;
};

/**
 * WebSocket 클라이언트 인스턴스 재설정 (테스트용)
 */
export const resetChatWebSocketClient = (): void => {
  if (chatWebSocketInstance) {
    chatWebSocketInstance.disconnect();
    chatWebSocketInstance = null;
  }
};
