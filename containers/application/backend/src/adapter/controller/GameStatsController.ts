import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import type { GameUseCases } from '../../container/game.container.ts';

interface SaveStatsBody {
  gameId?: string;
  leftUserId: string;
  rightUserId: string;
  leftAlias?: string | null;
  rightAlias?: string | null;
  leftScore: number;
  rightScore: number;
  winner: 'left' | 'right';
  endedAt?: number;
}

interface ListQuery {
  limit?: string;
  offset?: string;
}

export default async function GameStatsController(
  server: FastifyInstance,
  opts: { useCases: GameUseCases },
) {
  const { saveGameResult, listGameRecords } = opts.useCases;

  server.post<{ Body: SaveStatsBody }>(
    '/stats',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Body: SaveStatsBody }>,
      reply: FastifyReply,
    ) => {
      try {
        const authUser = req.authUserId;
        const requesterId = authUser?.get();
        if (!requesterId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const {
          gameId,
          leftUserId,
          rightUserId,
          leftAlias,
          rightAlias,
          leftScore,
          rightScore,
          winner,
          endedAt,
        } = req.body;

        if (winner !== 'left' && winner !== 'right') {
          return reply.status(400).send({ error: 'winner must be left or right' });
        }

        if (requesterId !== leftUserId && requesterId !== rightUserId) {
          return reply.status(403).send({ error: 'Not allowed to submit stats for others' });
        }

        const records = await saveGameResult.execute({
          gameId,
          leftUserId,
          rightUserId,
          leftAlias: leftAlias ?? null,
          rightAlias: rightAlias ?? null,
          leftScore,
          rightScore,
          winner,
          endedAt,
        });

        reply.status(201).send(records);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );

  server.get<{ Querystring: ListQuery }>(
    '/stats',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Querystring: ListQuery }>,
      reply: FastifyReply,
    ) => {
      try {
        const authUser = req.authUserId;
        const requesterId = authUser?.get();
        if (!requesterId) {
          return reply.status(401).send({ error: 'Unauthorized' });
        }

        const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
        const offset = req.query.offset ? parseInt(req.query.offset, 10) : undefined;

        const records = await listGameRecords.execute(requesterId, {
          limit,
          offset,
        });

        reply.status(200).send(records);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );
}
