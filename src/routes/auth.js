import path from 'node:path';
import fs from 'node:fs';

export default async function authRoutes(fastify) {
  const usernameEnv = process.env.USERNAME || 'admin';
  const passwordEnv = process.env.PASSWORD || 'supersecretpassword';

  fastify.get('/login', async (request, reply) => {
    if (request.session?.authenticated) {
      return reply.redirect('/feed');
    }
    return reply.view('login.ejs', { title: 'Login - Mini-Reddit' });
  });

  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body || {};
    if (username === usernameEnv && password === passwordEnv) {
      request.session.authenticated = true;
      request.session.username = username;
      return reply.redirect('/feed');
    }
    return reply.view('login.ejs', { title: 'Login - Mini-Reddit', error: 'Invalid credentials' });
  });

  fastify.get('/logout', async (request, reply) => {
    request.destroySession(() => {
      reply.redirect('/login');
    });
  });
}


