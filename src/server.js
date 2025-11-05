import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyStatic from '@fastify/static';
import fastifyView from '@fastify/view';
import formbody from '@fastify/formbody';
import ejs from 'ejs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev_session_secret_change_me_please_1234567890';
const IS_PROD = process.env.NODE_ENV === 'production';

// Ensure required directories exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const viewsDir = path.join(__dirname, 'views');
const configPath = path.join(__dirname, 'config.json');

const app = fastify({ logger: true, trustProxy: true });

await app.register(formbody);
await app.register(fastifyCookie);
await app.register(fastifySession, {
  secret: SESSION_SECRET,
  cookieName: 'mini_reddit_sid',
  cookie: {
    secure: 'auto',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90 // 90 days (3 months)
  },
  rolling: true, // Extends session on each request
  saveUninitialized: false
});

await app.register(fastifyStatic, {
  root: publicDir,
  prefix: '/public/'
});

await app.register(fastifyView, {
  engine: { ejs },
  root: viewsDir
});

// Decorator to check authentication for protected routes
app.addHook('preHandler', async (request, reply) => {
  const isAuth = request.session?.authenticated;
  const url = request.raw.url || '';
  const isLoginOrAsset = url.startsWith('/login') || url.startsWith('/public/') || url.startsWith('/health');
  if (!isLoginOrAsset && !isAuth) {
    return reply.redirect('/login');
  }
});

// Health check
app.get('/health', async () => ({ ok: true }));

// Register routes
await app.register((await import('./routes/auth.js')).default, { prefix: '/' });
await app.register((await import('./routes/feed.js')).default, { prefix: '/' });
await app.register((await import('./routes/subs.js')).default, { prefix: '/' });

// Ensure default config exists
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ subreddits: ['galatasaray', 'soccer'] }, null, 2));
}

try {
  await app.listen({ port: PORT, host: '0.0.0.0' });
  app.log.info(`Server running on http://localhost:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}


