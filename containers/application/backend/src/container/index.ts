import { initUserUseCases } from './user.container.ts';
import { initAuthUsecases } from './auth.container.ts';
import { initChatUseCases } from './chat.container.ts';
// import { createGameUseCases } from './game.container.ts';

const userUseCases = await initUserUseCases();
const authUseCases = await initAuthUsecases();
const chatUseCases = await initChatUseCases();

export const container = {
  userUseCases,
  authUseCases,
  chatUseCases,
  //   gameUseCases,
};

export type AppContainer = typeof container;
