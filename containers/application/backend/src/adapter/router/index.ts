import type { FastifyInstance } from 'fastify';
import HealthController from '../controller/HealthController.ts';
import UserController from '../controller/UserController.ts';
import { AppContainer } from '../../container/index.ts';

export async function registRouters(
  server: FastifyInstance,
  appContainer: AppContainer,
) {
  await server.register(HealthController);
  await server.register(UserController, {
    prefix: '/users',
    useCases: appContainer.userUseCases,
  });
}
