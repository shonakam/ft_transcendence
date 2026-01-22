import type { JsonObject } from './json';

export type WsMessage<TType extends string = string, TPayload extends JsonObject = JsonObject> =
  JsonObject & { type: TType; payload: TPayload };
