import type { FastifyInstance } from 'fastify';
import type {
  CreateUserForm,
  UpdateUserForm,
  DeleteUserForm,
} from '../../domain/user/form/UserForm.ts';
import { UserUseCases } from '../../container/user.container.ts';

export default async function UserController(
  server: FastifyInstance,
  opts: { useCases: UserUseCases },
) {
  const { createUser, getUser, listUsers, updateUser, deleteUser } =
    opts.useCases;

  server.post('/create', async (req, reply) => {
    try {
      const form = req.body as CreateUserForm;
      const user = await createUser.execute(form);
      reply.send(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        reply.status(400).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });
}
