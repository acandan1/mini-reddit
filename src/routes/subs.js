import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '..', 'config.json');

function readConfig() {
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.subreddits) ? parsed.subreddits : [];
  } catch {
    return [];
  }
}

function writeConfig(subreddits) {
  fs.writeFileSync(configPath, JSON.stringify({ subreddits }, null, 2));
}

export default async function subsRoutes(fastify) {
  fastify.post('/subs/add', async (request, reply) => {
    const { subreddit } = request.body || {};
    const sub = String(subreddit || '').trim().replace(/^r\//i, '');
    if (!sub) return reply.redirect('/feed');
    const subs = readConfig();
    if (!subs.includes(sub)) subs.push(sub);
    writeConfig(subs);
    return reply.redirect('/feed');
  });

  fastify.post('/subs/remove', async (request, reply) => {
    const { subreddit } = request.body || {};
    const sub = String(subreddit || '').trim().replace(/^r\//i, '');
    const subs = readConfig();
    const next = subs.filter((s) => s.toLowerCase() !== sub.toLowerCase());
    writeConfig(next);
    return reply.redirect('/feed');
  });
}


