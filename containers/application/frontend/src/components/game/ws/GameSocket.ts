import type {
  GameState,
  PlayerInput,
  ClientMessage,
  ServerMessage,
} from '@shonakam/common';
import { toaster } from '../../common/Toaster';
import { api } from '../../../lib/httpClient';

export type GameSocketCallbacks = {
  onRegistered?: (userId: string) => void;
  onGameGenerated?: (gameId: number, state: GameState) => void;
  onPlayerAdded?: (gameId: number, side: 'left' | 'right') => void;
  onOpponentJoined?: (gameId: number, opponentId: string) => void;
  onGameReady?: (
    gameId: number,
    leftPlayer: string,
    rightPlayer: string,
    yourSide: 'left' | 'right'
  ) => void;
  onGameStart?: (gameId: number) => void;
  onGameState?: (state: GameState) => void;
  onPlayerLeft?: (gameId: number, playerId: string) => void;
  onGameLeft?: (gameId: number) => void;
  onError?: (message: string) => void;
};

export class GameSocket {
  baseUrl: string = 'wss://transcendence.42.fr';
  path: string = '/ws/game/remote';
  url: string = this.baseUrl + this.path;
  private socket: WebSocket | null = null;
  private callbacks: GameSocketCallbacks | null = null;
  private isConnecting = false;
  private hasGameStarted = false; // ゲーム開始トースト用フラグ

  async connect(callbacks: GameSocketCallbacks): Promise<void> {
    if (this.socket || this.isConnecting) return;
    this.callbacks = callbacks;
    this.isConnecting = true;

    // WebSocket接続前にトークンをリフレッシュ（JWT期限切れ対策）
    try {
      await api.post('auth/refresh', {});
    } catch {
      // リフレッシュ失敗しても接続は試みる（サーバー側で判断）
    }

    try {
      this.socket = new WebSocket(this.url);
      this.registerEventListeners();
    } catch {
      this.isConnecting = false;
      toaster.show('WebSocket接続に失敗しました', 'error');
    }
  }

  private registerEventListeners(): void {
    if (!this.socket) return;

    this.socket.addEventListener('open', () => {
      this.isConnecting = false;
      toaster.show('ゲームサーバーに接続しました', 'success');
    });

    this.socket.addEventListener('close', (event) => {
      this.isConnecting = false;
      this.socket = null;
      // 1008 = Policy Violation (認証エラー)
      // 1006 = Abnormal Closure (ネットワークエラーまたは認証前の拒否)
      if (event.code === 1008 || event.code === 1006) {
        toaster.show(
          'ゲームサーバーへの接続が拒否されました。ログインし直してください。',
          'error'
        );
      } else if (event.code !== 1000) {
        // 1000 = Normal Closure
        toaster.show('ゲームサーバーから切断されました', 'info');
      }
    });

    this.socket.addEventListener('error', () => {
      this.isConnecting = false;
      toaster.show('WebSocket接続エラーが発生しました', 'error');
    });

    this.socket.addEventListener('message', (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch {
        // パースエラーは無視
      }
    });
  }

  private handleMessage(message: ServerMessage): void {
    switch (message.type) {
      case 'connected':
        break;
      case 'disconnected':
        break;
      case 'registered':
        toaster.show(`ユーザー登録完了: ${message.payload.userId}`, 'success');
        this.callbacks?.onRegistered?.(message.payload.userId);
        break;
      case 'unregistered':
        break;
      case 'gameGenerated':
        toaster.show(`ゲーム作成完了: ID ${message.payload.gameId}`, 'success');
        this.callbacks?.onGameGenerated?.(
          message.payload.gameId,
          message.payload.state
        );
        break;
      case 'playerAdded':
        toaster.show(
          `ゲーム ${message.payload.gameId} に参加しました`,
          'success'
        );
        this.callbacks?.onPlayerAdded?.(
          message.payload.gameId,
          message.payload.side
        );
        break;
      case 'opponentJoined':
        toaster.show(
          `${message.payload.opponentId} がゲームに参加しました`,
          'info'
        );
        this.callbacks?.onOpponentJoined?.(
          message.payload.gameId,
          message.payload.opponentId
        );
        break;
      case 'gameReady':
        toaster.show('ゲーム準備完了！スペースキーでスタート', 'info');
        this.callbacks?.onGameReady?.(
          message.payload.gameId,
          message.payload.leftPlayer,
          message.payload.rightPlayer,
          message.payload.yourSide
        );
        break;
      case 'gameStart':
        if (!this.hasGameStarted) {
          toaster.show('ゲーム開始！', 'info');
          this.hasGameStarted = true;
        }
        this.callbacks?.onGameStart?.(message.payload.gameId);
        break;
      case 'gameState':
        this.callbacks?.onGameState?.(message.payload);
        break;
      case 'error':
        toaster.show(`エラー: ${message.payload.message}`, 'error');
        this.callbacks?.onError?.(message.payload.message);
        break;
      case 'playerLeft':
        toaster.show(
          `${message.payload.playerId} がゲームから退出しました`,
          'info'
        );
        this.callbacks?.onPlayerLeft?.(
          message.payload.gameId,
          message.payload.playerId
        );
        break;
      case 'gameLeft':
        toaster.show('ゲームから退出しました', 'info');
        this.callbacks?.onGameLeft?.(message.payload.gameId);
        break;
      case 'demoResponse':
        break;
      default:
        break;
    }
  }

  private send(message: ClientMessage): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // --- 公開メソッド ---

  getSocket(): WebSocket | null {
    return this.socket;
  }

  sendRegister(userId: string): void {
    this.send({ type: 'register', payload: { userId } });
  }

  sendCreateGame(): void {
    this.send({ type: 'createGame' });
  }

  sendJoinGame(gameId: number): void {
    this.send({ type: 'join', payload: { gameId } });
  }

  sendInput(input: PlayerInput): void {
    this.send({ type: 'playerInput', payload: { input } });
  }

  sendLeaveGame(): void {
    this.send({ type: 'leave' });
  }

  sendDemoRequest(): void {
    this.send({ type: 'demo' });
  }

  close(): void {
    this.socket?.close();
  }
}
