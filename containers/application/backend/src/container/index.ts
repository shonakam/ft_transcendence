import { initUserUseCases } from './user.container.ts';
import { initAuthUsecases } from './auth.container.ts';
// import { createGameUseCases } from './game.container.ts';

const userUseCases = await initUserUseCases();
const authUseCases = await initAuthUsecases();

export const container = {
  userUseCases,
  authUseCases,
  //   gameUseCases,
};

export type AppContainer = typeof container;
