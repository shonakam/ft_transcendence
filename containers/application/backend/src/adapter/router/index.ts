import type { FastifyInstance } from 'fastify';
import HealthController from '../controller/HealthController.ts';
import UserController from '../controller/UserController.ts';
import AuthController from '../controller/AuthController.ts';
import { AppContainer } from '../../container/index.ts';
import { config } from '../../conf.ts';

export async function registRouters(
  server: FastifyInstance,
  appContainer: AppContainer,
) {
  await server.register(HealthController);
  await server.register(AuthController, {
    prefix: '/api/v1/auth',
    useCases: appContainer.authUseCases,
  });
  await server.register(UserController, {
    prefix: '/api/v1/users',
    useCases: appContainer.userUseCases,
  });
}
