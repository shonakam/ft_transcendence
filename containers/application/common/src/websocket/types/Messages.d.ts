import { Direction } from "../../game/types/Direction";
import { GameState } from "../../game/GameState";

// client → server
type ClientMessage =
  | { type: "MOVE"; direction: Direction }
  | { type: "MESSAGE"; content: string }
  | { type: "CREATE" }
  | { type: "JOIN"; roomId: string };

// server → client
type ServerMessage =
  | { type: "STATE"; state: GameState }
  | { type: "MESSAGE"; content: string }
  | { type: "ERROR"; message: string }
  | { type: "JOINED"; roomId: string };
