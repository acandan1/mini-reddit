import { cache } from './cache.js';

const DEFAULT_LIMIT = 25;
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function fetchSubredditPosts(subreddit, options = {}) {
  const limit = Number(options.limit || DEFAULT_LIMIT);
  const ttlMs = Number(options.cacheTtlMs || DEFAULT_TTL_MS);
  const cacheKey = `sub:${subreddit}:limit:${limit}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${limit}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'mini-reddit/1.0 (+https://example.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }
  const data = await response.json();
  const posts = (data?.data?.children || []).map((child) => {
    const p = child.data || {};
    return {
      id: p.id,
      title: p.title,
      url: p.url_overridden_by_dest || p.url,
      permalink: `https://www.reddit.com${p.permalink}`,
      createdUtc: p.created_utc,
      author: p.author,
      numComments: p.num_comments,
      score: p.score,
      subreddit: p.subreddit,
      selftext: p.selftext || ''
    };
  });

  cache.set(cacheKey, posts, ttlMs);
  return posts;
}


