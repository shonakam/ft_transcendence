import { createUserUseCases } from './user.container.ts';
// import { createGameUseCases } from './game.container.ts';

const userUseCases = await createUserUseCases();

export const container = {
  userUseCases,
  //   gameUseCases,
};

export type AppContainer = typeof container;
