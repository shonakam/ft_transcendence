import type { FastifyInstance } from 'fastify';
import type {
  CreateUserForm,
  UpdateUserForm,
  DeleteUserForm,
} from '../../domain/user/form/UserForm.ts';
import { UserUseCases } from '../../container/user.container.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { Pagination } from '../../domain/user/vo/Pagination.ts';

export default async function UserController(
  server: FastifyInstance,
  opts: { useCases: UserUseCases },
) {
  const { createUser, getUser, listUsers, updateUser, deleteUser } =
    opts.useCases;
  const DEFAULT_OFFSET = 0;
  const DEFAULT_LIMIT = 20;

  // CREATE
  server.post(
    '/',
    async (req, reply) => {
      try {
        const form = req.body as CreateUserForm;
        const user = await createUser.execute(form);
        reply.status(201).send(user);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // UPDATE
  server.put(
    '/:id',
    async (req, reply) => {
      try {
        const form = req.body as UpdateUserForm;
        const user = await updateUser.execute(form);
        reply.status(200).send(user);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // GET user detail
  server.get<{ Params: { id: string }}>(
    '/:id',
    async (req, reply) => {
      try {
        const target = UserId.from(req.params.id);
        const user = await getUser.execute(target);
        user 
          ? reply.send(user) 
          : reply.status(404).send({ message: 'User not found' });
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // GET user list 
  server.get<{ Querystring: { offset?: number; limit?: number }}>(
    '/',
    async (req, reply) => {
      try {
        const page = Pagination.from(req.query.offset, req.query.limit);
        const users = await listUsers.execute(page.getOffset(), page.getLimit());
        reply.status(200).send(users);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // DELETE
  server.delete(
    '/:id',
    async (req, reply) => {
      try {
        const form = req.body as DeleteUserForm;
        const user = await deleteUser.execute(form);
        reply.status(204).send(user);
      } catch (err: unknown) {
        if (err instanceof Error) {
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );
}
