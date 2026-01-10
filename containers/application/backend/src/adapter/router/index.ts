import type { FastifyInstance } from 'fastify';
import HealthController from '../controller/HealthController.ts';
import UserController from '../controller/UserController.ts';
import AuthController from '../controller/AuthController.ts';
import ChatController from '../controller/ChatController.ts';
import { AppContainer } from '../../container/index.ts';
import { config } from '../../conf.ts';

export async function registRouters(
  server: FastifyInstance,
  appContainer: AppContainer,
) {
  await server.register(HealthController, { prefix: '/api/' });
  await server.register(AuthController, {
    prefix: '/api/auth',
    useCases: appContainer.authUseCases,
  });
  await server.register(UserController, {
    prefix: '/api/users',
    useCases: appContainer.userUseCases,
  });
  await server.register(ChatController, {
    prefix: '/api/v1/chat',
    useCases: appContainer.chatUseCases,
  });
}
