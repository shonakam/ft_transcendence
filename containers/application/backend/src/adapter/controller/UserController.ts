import type { FastifyInstance } from 'fastify';
import { authenticate } from '../auth/authPreHandler.ts';
import type {
  CreateUserForm,
  UpdateUserForm,
  DeleteUserForm,
} from '../../domain/user/form/request/UserForm.ts';
import { UserUseCases } from '../../container/user.container.ts';
import UserId from '../../domain/user/vo/UserId.ts';
import { Pagination } from '../../domain/user/vo/Pagination.ts';
import minilog, { TAG } from '../../utils/minilog.ts';
import {
  UserRelationshipController,
  userRelationshipRoutes,
} from './UserRelationshipController.ts';

export default async function UserController(
  server: FastifyInstance,
  opts: { useCases: UserUseCases },
) {
  const { createUser, getUser, listUsers, updateUser, deleteUser } =
    opts.useCases;

  // CREATE
  server.post('/', async (req, reply) => {
    try {
      const form = req.body as CreateUserForm;
      const user = await createUser.execute(form);
      reply.status(201).send(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        minilog.w(TAG.USER, `${err.stack}`);
        reply.status(400).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });

  // UPDATE
  server.put('/me', { preHandler: authenticate }, async (req, reply) => {
    try {
      const trustedUserId = req.authUserId;
      if (trustedUserId === undefined) {
        return reply
          .status(500)
          .send({ message: 'Authentication data missing.' });
      }

      const body = req.body as any;
      let image: Buffer | null = null;
      if (body.image && body.image.type === 'file') {
        image = await body.image.toBuffer();
      }
      const form: UpdateUserForm = {
        username: body.username?.value ?? null,
        email: body.email?.value || null,
        password: body.password?.value || null,
        image,
      };

      console.log('body:', body);
      const user = await updateUser.execute(trustedUserId, form);
      reply.status(200).send(user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        minilog.w(TAG.USER, `${err.stack}`);
        reply.status(400).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });

  // GET user detail
  server.get<{ Params: { id: string } }>(
    '/me',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const trustedUserId = req.authUserId;
        if (trustedUserId === undefined) {
          return reply
            .status(500)
            .send({ message: 'Authentication data missing.' });
        }

        const user = await getUser.execute(trustedUserId);
        user
          ? reply.send(user)
          : reply.status(404).send({ message: 'User not found' });
      } catch (err: unknown) {
        if (err instanceof Error) {
          minilog.w(TAG.USER, `${err.stack}`);
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // GET public user profile
  server.get<{ Params: { id: string } }>(
    '/:id/profile',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const target = UserId.from(req.params.id);
        const user = await getUser.execute(target);
        if (!user) {
          return reply.status(404).send({ message: 'User not found' });
        }

        // Return only public fields
        reply.send({
          id: user.id,
          username: user.username,
          imagePath: user.imagePath,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          minilog.w(TAG.USER, `${err.stack}`);
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // GET user detail
  server.get<{ Params: { id: string } }>(
    '/:id',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const target = UserId.from(req.params.id);
        const user = await getUser.execute(target);
        user
          ? reply.send(user)
          : reply.status(404).send({ message: 'User not found' });
      } catch (err: unknown) {
        if (err instanceof Error) {
          minilog.w(TAG.USER, `${err.stack}`);
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // GET user list
  server.get<{ Querystring: { offset?: number; limit?: number } }>(
    '/',
    { preHandler: authenticate },
    async (req, reply) => {
      try {
        const page = Pagination.from(req.query.offset, req.query.limit);
        const users = await listUsers.execute(
          page.getOffset(),
          page.getLimit(),
        );
        reply.status(200).send(users);
      } catch (err: unknown) {
        if (err instanceof Error) {
          minilog.w(TAG.USER, `${err.stack}`);
          reply.status(400).send({ error: err.message });
        } else {
          reply.status(500).send({ message: 'Internal Server Error' });
        }
      }
    },
  );

  // DELETE
  server.delete('/me', { preHandler: authenticate }, async (req, reply) => {
    try {
      const trustedUserId = req.authUserId;
      if (trustedUserId === undefined) {
        return reply
          .status(500)
          .send({ message: 'Authentication data missing.' });
      }

      const form = req.body as DeleteUserForm;
      const user = await deleteUser.execute(trustedUserId, form);
      reply.status(204);
    } catch (err: unknown) {
      if (err instanceof Error) {
        minilog.w(TAG.USER, `${err.stack}`);
        reply.status(400).send({ error: err.message });
      } else {
        reply.status(500).send({ message: 'Internal Server Error' });
      }
    }
  });

  // Friend management
  const relationshipController = new UserRelationshipController(
    opts.useCases.userRelationship,
  );
  server.register(userRelationshipRoutes(relationshipController), {
    prefix: '/friends',
  });
}
