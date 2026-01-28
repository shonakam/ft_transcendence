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

interface UserIdParams {
  userId: string;
}

export default async function GameStatsController(
  server: FastifyInstance,
  opts: { useCases: GameUseCases },
) {
  const { saveGameResult, listGameRecords, gameRecordRepository } =
    opts.useCases;

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
          return reply
            .status(400)
            .send({ error: 'winner must be left or right' });
        }

        if (requesterId !== leftUserId && requesterId !== rightUserId) {
          return reply
            .status(403)
            .send({ error: 'Not allowed to submit stats for others' });
        }

        const record = await saveGameResult.execute({
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

        reply.status(201).send(record);
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

        const query = req.query as ListQuery;
        const limit = query.limit ? parseInt(query.limit, 10) : undefined;
        const offset = query.offset ? parseInt(query.offset, 10) : undefined;

        console.log(
          `[GameStatsController] Fetching stats for user: ${requesterId}`,
        );

        const records = await listGameRecords.execute(requesterId, {
          limit,
          offset,
        });

        console.log(
          `[GameStatsController] Found ${records.length} records for ${requesterId}`,
        );

        reply.status(200).send(records);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );

  // Get win rate for a specific user
  server.get<{ Params: UserIdParams }>(
    '/stats/:userId/winrate',
    { preHandler: authenticate },
    async (
      req: FastifyRequest<{ Params: UserIdParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = req.params;

        if (!userId) {
          return reply.status(400).send({ error: 'userId is required' });
        }

        const winRate = await gameRecordRepository.getWinRateByUserId(userId);
        reply.status(200).send(winRate);
      } catch (err: any) {
        reply.status(500).send({ error: err.message });
      }
    },
  );
}
