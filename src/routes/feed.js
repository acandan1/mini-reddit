import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { fetchSubredditPosts, fetchPostWithComments, parseRedditUrl } from '../utils/fetchReddit.js';

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
  fastify.get('/', async (request, reply) => {
    return reply.redirect('/feed');
  });

  fastify.get('/feed', async (request, reply) => {
    const subs = readConfig();
    const sort = request.query.sort || 'hot';
    const timeframe = request.query.t || 'day';
    const limit = 25;
    
    const results = await Promise.allSettled(
      subs.map((s) => fetchSubredditPosts(s, { limit, sort, timeframe }))
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

    // Sort by createdUtc for 'new', otherwise by score for combined feed
    if (sort === 'new') {
      posts.sort((a, b) => b.createdUtc - a.createdUtc);
    } else {
      posts.sort((a, b) => b.score - a.score);
    }

    return reply.view('feed.ejs', {
      title: 'Your Feed - Mini-Reddit',
      username: request.session?.username,
      subreddits: subs,
      posts,
      currentSubreddit: null,
      currentSort: sort,
      currentTimeframe: timeframe
    });
  });

  fastify.get('/r/:subreddit', async (request, reply) => {
    const { subreddit } = request.params;
    const subs = readConfig();
    const sort = request.query.sort || 'hot';
    const timeframe = request.query.t || 'day';
    
    // Check if user has access to this subreddit
    if (!subs.some(s => s.toLowerCase() === subreddit.toLowerCase())) {
      return reply.status(403).send('Subreddit not in your list');
    }

    const limit = 50;
    try {
      const posts = await fetchSubredditPosts(subreddit, { limit, sort, timeframe });
      return reply.view('subreddit.ejs', {
        title: `r/${subreddit} - Mini-Reddit`,
        username: request.session?.username,
        subreddits: subs,
        posts,
        currentSubreddit: subreddit,
        currentSort: sort,
        currentTimeframe: timeframe
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send('Failed to fetch subreddit');
    }
  });

  fastify.get('/post/:subreddit/:postId', async (request, reply) => {
    const { subreddit, postId } = request.params;
    try {
      const { post, comments } = await fetchPostWithComments(subreddit, postId);
      return reply.view('post.ejs', {
        title: `${post.title} - Mini-Reddit`,
        username: request.session?.username,
        post,
        comments
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(404).send('Post not found');
    }
  });

  // New endpoint to fetch any Reddit post by URL
  fastify.get('/fetch', async (request, reply) => {
    const subs = readConfig();
    return reply.view('fetch.ejs', {
      title: 'Fetch Reddit Post - Mini-Reddit',
      username: request.session?.username,
      subreddits: subs,
      error: null,
      post: null,
      comments: null
    });
  });

  fastify.post('/fetch', async (request, reply) => {
    const { url } = request.body || {};
    const subs = readConfig();

    if (!url || typeof url !== 'string') {
      return reply.view('fetch.ejs', {
        title: 'Fetch Reddit Post - Mini-Reddit',
        username: request.session?.username,
        subreddits: subs,
        error: 'Please provide a valid Reddit URL',
        post: null,
        comments: null
      });
    }

    const parsed = parseRedditUrl(url.trim());
    if (!parsed) {
      return reply.view('fetch.ejs', {
        title: 'Fetch Reddit Post - Mini-Reddit',
        username: request.session?.username,
        subreddits: subs,
        error: 'Invalid Reddit URL format. Please use a URL like: https://reddit.com/r/subreddit/comments/postid/title',
        post: null,
        comments: null
      });
    }

    try {
      const { post, comments } = await fetchPostWithComments(parsed.subreddit, parsed.postId);
      return reply.view('fetch.ejs', {
        title: `${post.title} - Mini-Reddit`,
        username: request.session?.username,
        subreddits: subs,
        error: null,
        post,
        comments
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.view('fetch.ejs', {
        title: 'Fetch Reddit Post - Mini-Reddit',
        username: request.session?.username,
        subreddits: subs,
        error: 'Failed to fetch post. Please check the URL and try again.',
        post: null,
        comments: null
      });
    }
  });
}


