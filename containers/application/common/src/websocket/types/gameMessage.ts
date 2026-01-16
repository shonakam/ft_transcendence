import { WsMessage } from './WsMessage';

// client → server
export type ClientMessage =
  | WsMessage<'playerInput', PlayerInputPayload>
  | WsMessage<'joinRequest', { gameMode: string; options: JsonObject }>
  | WsMessage<'join', { roomId: string }>
  | WsMessage<'start', { roomId: string }>
  | WsMessage<'leave', { roomId: string }>
  // | WsMessage<'ping', { nonce: string }>
  // | WsMessage<'syncRequest', { since?: number }>
  // | WsMessage<'rematch', { previousRoomId: string }>
  | WsMessage<'ack', { type: string; nonce?: string }>;
  // | WsMessage<'custom', JsonObject>;

// server → client
export type ServerMessage =
  | WsMessage<'state', StatePayload>
  | WsMessage<'score', ScorePayload>
  | WsMessage<'start', { roomId: string; startedAt: number }>
  | WsMessage<'stop', MatchReadyPayload>
  | WsMessage<'finish', { roomId: string; winner: PlayerSlot | null }>
  | WsMessage<'error', ErrorPayload>;
  // | WsMessage<'pong', { nonce: string }>
  // | WsMessage<'sync', { state: JsonObject; serverTime: number }>
  // | WsMessage<'custom', JsonObject>;

// // client -> server
// export interface ClientToServerEvents {
//   playerInput: PlayerInputPayload;
//   joinRequest: { gameMode: string; options: JsonObject };
//   join: { roomId: string };
//   start: { roomId: string };
//   leave: { roomId: string };
//   ack: { type: string; nonce?: string };
// }

// // server -> client
// export interface ServerToClientEvents {
//   state: StatePayload;
//   score: ScorePayload;
//   start: { roomId: string; startedAt: number };
//   stop: MatchReadyPayload;
//   finish: { roomId: string; winner: PlayerSlot | null };
//   error: ErrorPayload;
// }
