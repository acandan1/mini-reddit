import { cache } from './cache.js';

const DEFAULT_LIMIT = 25;
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

function extractMediaInfo(post) {
  const p = post.data || post;
  const mediaInfo = {
    hasImage: false,
    hasVideo: false,
    hasGallery: false,
    imageUrl: null,
    videoUrl: null,
    thumbnailUrl: p.thumbnail && p.thumbnail.startsWith('http') ? p.thumbnail : null,
    galleryItems: []
  };

  // Check for image posts
  if (p.post_hint === 'image' && p.url) {
    mediaInfo.hasImage = true;
    mediaInfo.imageUrl = p.url;
  }

  // Check for video (reddit hosted)
  if (p.is_video && p.media?.reddit_video) {
    mediaInfo.hasVideo = true;
    mediaInfo.videoUrl = p.media.reddit_video.fallback_url;
    mediaInfo.hasAudioTrack = p.media.reddit_video.has_audio || false;
    
    // Reddit separates audio and video streams for DASH
    // Audio URL follows pattern: DASH_AUDIO_128.mp4 (or DASH_audio_128.mp4) with same query params
    if (mediaInfo.hasAudioTrack) {
      const videoUrl = p.media.reddit_video.fallback_url;
      // Replace DASH_XXX.mp4 with DASH_AUDIO_128.mp4, preserving query params
      mediaInfo.audioUrl = videoUrl.replace(/DASH_\d+\.mp4/, 'DASH_AUDIO_128.mp4')
                                    .replace(/DASH_audio\.mp4/, 'DASH_AUDIO_128.mp4');
    }
    
    mediaInfo.hlsUrl = p.media.reddit_video.hls_url; // Alternative: HLS stream
    mediaInfo.dashUrl = p.media.reddit_video.dash_url; // DASH manifest
  }

  // Check for gallery
  if (p.is_gallery && p.media_metadata) {
    mediaInfo.hasGallery = true;
    mediaInfo.galleryItems = Object.values(p.media_metadata).map((item) => {
      const imgData = item.s || {};
      return {
        url: imgData.u ? imgData.u.replace(/&amp;/g, '&') : null,
        width: imgData.x,
        height: imgData.y
      };
    }).filter(item => item.url);
  }

  return mediaInfo;
}

export async function fetchSubredditPosts(subreddit, options = {}) {
  const limit = Number(options.limit || DEFAULT_LIMIT);
  const ttlMs = Number(options.cacheTtlMs || DEFAULT_TTL_MS);
  const sort = options.sort || 'hot'; // hot, new, top, rising, controversial
  const timeframe = options.timeframe || 'day'; // hour, day, week, month, year, all (for 'top' sort)
  
  const cacheKey = `sub:${subreddit}:limit:${limit}:sort:${sort}:time:${timeframe}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Build URL based on sort type
  let url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/${sort}.json?limit=${limit}`;
  if (sort === 'top' || sort === 'controversial') {
    url += `&t=${timeframe}`;
  }

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
    const media = extractMediaInfo(child);
    return {
      id: p.id,
      title: p.title,
      url: p.url_overridden_by_dest || p.url,
      permalink: p.permalink,
      createdUtc: p.created_utc,
      author: p.author,
      numComments: p.num_comments,
      score: p.score,
      subreddit: p.subreddit,
      selftext: p.selftext || '',
      selftextHtml: p.selftext_html || null,
      ...media
    };
  });

  cache.set(cacheKey, posts, ttlMs);
  return posts;
}

export async function fetchPostWithComments(subreddit, postId, options = {}) {
  const ttlMs = Number(options.cacheTtlMs || DEFAULT_TTL_MS);
  const cacheKey = `post:${subreddit}:${postId}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(postId)}.json`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'mini-reddit/1.0 (+https://example.com)'
    }
  });
  if (!response.ok) {
    throw new Error(`Reddit API error: ${response.status}`);
  }
  const data = await response.json();
  
  // First element is the post, second is comments
  const postData = data[0]?.data?.children?.[0]?.data;
  const commentsData = data[1]?.data?.children || [];

  if (!postData) {
    throw new Error('Post not found');
  }

  const media = extractMediaInfo({ data: postData });
  const post = {
    id: postData.id,
    title: postData.title,
    url: postData.url_overridden_by_dest || postData.url,
    permalink: postData.permalink,
    createdUtc: postData.created_utc,
    author: postData.author,
    numComments: postData.num_comments,
    score: postData.score,
    subreddit: postData.subreddit,
    selftext: postData.selftext || '',
    selftextHtml: postData.selftext_html || null,
    ...media
  };

  function parseComment(commentData, depth = 0) {
    const c = commentData.data;
    if (!c || c.author === '[deleted]') return null;
    
    return {
      id: c.id,
      author: c.author,
      body: c.body || '',
      bodyHtml: c.body_html || null,
      score: c.score,
      createdUtc: c.created_utc,
      depth,
      replies: (c.replies?.data?.children || [])
        .map(reply => parseComment(reply, depth + 1))
        .filter(Boolean)
    };
  }

  const comments = commentsData
    .map(comment => parseComment(comment, 0))
    .filter(Boolean);

  const result = { post, comments };
  cache.set(cacheKey, result, ttlMs);
  return result;
}


