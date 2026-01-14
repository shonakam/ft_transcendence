import type { WsMessage } from "./types/wsMessage";
import { isJsonObject } from "./isJsonValue";

export function isWsMessage(value: unknown): value is WsMessage {
  if (!isJsonObject(value))
    return false;
  if (typeof value.type !== 'string')
    return false;
  if (!isJsonObject(value.payload))
    return false;
  return true;
}
