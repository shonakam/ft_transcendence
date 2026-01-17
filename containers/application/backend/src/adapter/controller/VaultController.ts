import { FastifyInstance } from 'fastify';
import { VaultService } from '../../infra/vault/vault.service.ts';

// 演示用：实际生产应加权限校验
export default async function VaultController(server: FastifyInstance) {
  const vaultService = new VaultService();

  // 存储 secret
  server.post('/api/vault/set-secret', async (request, reply) => {
    const { path, data } = request.body as {
      path: string;
      data: Record<string, any>;
    };
    if (!path || !data)
      return reply.code(400).send({ error: 'path/data required' });
    await vaultService.setSecret(path, data);
    return { ok: true };
  });

  // 读取 secret
  server.get('/api/vault/get-secret', async (request, reply) => {
    const { path } = request.query as { path: string };
    if (!path) return reply.code(400).send({ error: 'path required' });
    const secret = await vaultService.getSecret(path);
    return { secret };
  });
}
