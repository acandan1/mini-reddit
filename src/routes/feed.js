import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fetchSubredditPosts } from '../utils/fetchReddit.js';

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

export default async function feedRoutes(fastify) {
  fastify.get('/feed', async (request, reply) => {
    const subs = readConfig();
    const limit = 25;
    const results = await Promise.allSettled(
      subs.map((s) => fetchSubredditPosts(s, { limit }))
    );

    const posts = [];
    results.forEach((res, idx) => {
      const sub = subs[idx];
      if (res.status === 'fulfilled') {
        res.value.forEach((p) => posts.push({ ...p, subreddit: sub }));
      } else {
        fastify.log.warn({ sub, err: res.reason }, 'Failed to fetch subreddit');
      }
    });

    posts.sort((a, b) => b.createdUtc - a.createdUtc);

    return reply.view('feed.ejs', {
      title: 'Your Feed - Mini-Reddit',
      username: request.session?.username,
      subreddits: subs,
      posts
    });
  });
}


