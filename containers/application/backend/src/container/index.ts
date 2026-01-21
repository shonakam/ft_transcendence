import { initUserUseCases } from './user.container.ts';
import { initAuthUsecases } from './auth.container.ts';
import { initChatUseCases } from './chat.container.ts';
import { GameSessionRegistry } from './GameSessionRegistry.ts';

const userUseCases = await initUserUseCases();
const authUseCases = await initAuthUsecases();
const chatUseCases = await initChatUseCases();
const gameSessionRegistry = new GameSessionRegistry();

export const container = {
  userUseCases,
  authUseCases,
  chatUseCases,
  gameSessionRegistry,
};

export type AppContainer = typeof container;
