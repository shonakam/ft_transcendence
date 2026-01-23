import { initUserUseCases } from './user.container.ts';
import { initAuthUsecases } from './auth.container.ts';
import { initChatUseCases } from './chat.container.ts';
import { initGameUseCases } from './game.container.ts';
import { GameSessionRegistry } from './GameSessionRegistry.ts';
import { GameSocketRegistry } from './GameSocketRegistry.ts';

const userUseCases = await initUserUseCases();
const authUseCases = await initAuthUsecases();
const chatUseCases = await initChatUseCases();
const gameUseCases = await initGameUseCases();
const gameSocketRegistry = new GameSocketRegistry();
const gameSessionRegistry = new GameSessionRegistry();

export const container = {
  userUseCases,
  authUseCases,
  chatUseCases,
  gameUseCases,
  gameSocketRegistry,
  gameSessionRegistry,
};

export type AppContainer = typeof container;
