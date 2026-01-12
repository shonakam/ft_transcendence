import { FastifyInstance } from 'fastify';
import ws from '@fastify/websocket';

export function registerWebSocket(fastify: FastifyInstance) {
  fastify.register(ws, {
    options: { maxPayload: 1048576 },
  });

  fastify.register(async function (fastify) {
    // fastify.get('/ws/*', { websocket: true }, (socket, req) => {
    //   socket.on('message', (message: unknown) => {
    //     console.log('Received message on /ws/*:', message);
    //   });
    // });

    fastify.get('/ws/game/remote', { websocket: true }, (socket) => {
      socket.on('message', (message: unknown) => {
        console.log('Received message on /ws/game/remote:', message);
        // refresh game state logic here
      });
    });

    fastify.get('/ws/chat', { websocket: true }, (socket) => {
      socket.on('message', (message: unknown) => {
        console.log('Received message on /ws/chat:', message);
        // chat handling logic here
      });
    });

    console.log('WebSocket routes registered');
  });
}
