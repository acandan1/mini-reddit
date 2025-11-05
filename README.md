# 🧠 Mini-Reddit

A minimalist, self-hosted Reddit viewer that shows only the subreddits you actually care about — with no algorithm, no front page, and no politics.

This app runs as a small Fastify web server with cookie-based login and a simple HTML/Tailwind UI for browsing selected subreddit feeds.

---

## 🚀 Overview

**Mini-Reddit** is a lightweight private web app that lets you view a clean feed from a few chosen subreddits (like `r/galatasaray`, `r/soccer`, or `r/chess`) without the rest of Reddit.

It uses Reddit’s public JSON API — no API keys required — and caches posts locally to reduce network requests.

The app includes:

* Basic login (hardcoded credentials in `.env`)
* **Long-lasting sessions** — stay logged in for 3 months
* Editable subreddit list (via the UI)
* Server-side feed fetching & caching
* **Self-contained post viewing** — no external Reddit links needed
* **Full comment threads** with nested replies
* **Reddit-flavored Markdown support** — proper rendering of posts and comments
* **Fetch any Reddit post by URL** — paste any Reddit link to view it in Mini-Reddit
* **Media embedding** — images, videos, and galleries display inline
* **Dark mode** with system preference detection
* Clean, modern, mobile-friendly UI with Tailwind CSS
* Enhanced accessibility and keyboard navigation
* Low resource usage (<50MB RAM idle)

---

## 🤩 Architecture

### **Stack**

* **Backend:** Fastify (Node.js)
* **Frontend:** Server-side rendered HTML (EJS or Handlebars) + Tailwind CSS
* **Auth:** Session cookies (via `fastify-cookie` and `fastify-session`)
* **Data:** No database by default (config stored in JSON)
* **Optional persistence:** SQLite can be added later if needed

### **App Flow**

1. User navigates to the web app (e.g., `mini.yourdomain.com`).
2. If not logged in, they’re redirected to `/login`.
3. Login is verified against `.env` credentials.
4. A signed session cookie is set and persists across browser restarts.
5. The main `/feed` route fetches Reddit JSON for all subs in the config list.
6. Posts are cached for a short duration (e.g., 30 minutes) to limit API calls.
7. Users can add/remove subreddits from their list via the UI — updates are saved to `config.json`.

---

## 🗂 Directory Structure

```
mini-reddit/
├─ src/
│  ├─ server.js            # Main Fastify server
│  ├─ routes/
│  │   ├─ auth.js          # Login/logout endpoints
│  │   ├─ feed.js          # Fetches and serves subreddit feeds
│  │   └─ subs.js          # Manage subreddit list (add/remove)
│  ├─ utils/
│  │   ├─ fetchReddit.js   # Handles Reddit API fetching and caching
│  │   └─ cache.js         # Simple in-memory or file-based cache
│  ├─ views/
│  │   ├─ login.ejs
│  │   ├─ feed.ejs
│  │   └─ layout.ejs
│  └─ config.json          # Stores current subreddit list
│
├─ public/
│  └─ styles.css           # Tailwind build output
│
├─ .env                    # Contains username, password, session secret
├─ package.json
└─ README.md
```

---

## ⚙️ Configuration

### `.env` example

```bash
USERNAME=admin
PASSWORD=supersecretpassword
SESSION_SECRET=your_random_secret
PORT=3000
```

### `config.json` example

```json
{
  "subreddits": ["galatasaray", "soccer"]
}
```

---

## 🧠 Core Features

| Feature                          | Description                                           |
| -------------------------------- | ----------------------------------------------------- |
| **Login System**                 | Simple form with credentials from `.env`.             |
| **Persistent Sessions**          | Cookies last for 90 days with rolling expiration.     |
| **Subreddit Management**         | Add/remove subs dynamically via UI.                   |
| **Feed Caching**                 | Reduces redundant API calls (30 min default).         |
| **Post Viewing**                 | Click any post to view full content with comments.    |
| **Comment Threads**              | Nested comment display with proper indentation.       |
| **Markdown Rendering**           | Full Reddit-flavored Markdown support for posts/comments. |
| **Fetch Any Post**               | Paste any Reddit URL to view it without leaving app.  |
| **Media Embedding**              | Images, videos, and galleries display inline.         |
| **Dark Mode**                    | Toggle dark/light theme with persistent preference.   |
| **Mobile-Friendly**              | Responsive design optimized for all screen sizes.     |

---

## 🛠 Setup & Development

### 1. Clone the repo

```bash
git clone https://github.com/yourname/mini-reddit.git
cd mini-reddit
```

### 2. Install dependencies

```bash
bun install
```

### 3. Create your `.env` file

```bash
cp env.example .env
# Edit credentials and session secret
```

Or create it manually with:

```bash
USERNAME=admin
PASSWORD=supersecretpassword
SESSION_SECRET=your_random_secret_change_me
PORT=3000
```

### 4. Run the dev server

```bash
bun run dev
# or
npm run dev
```

Then visit `http://localhost:3000`

---

## ☁️ Deployment

Mini-Reddit can be deployed easily to your VPS using **Coolify** or a simple Docker setup.

### **Option 1: Direct (Node process)**

Use PM2:

```bash
pm2 start src/server.js --name mini-reddit
```

### **Option 2: Docker**

Create a `Dockerfile`:

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --omit=dev
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
```

Expose via Nginx or directly through Coolify at a subdomain (e.g., `mini.yourdomain.com`).

---

## ✨ Features Implemented

* ✅ Self-contained post viewing (no Reddit links needed)
* ✅ Full comment threads with nested replies
* ✅ **Reddit-flavored Markdown rendering** (bold, italic, links, code blocks, spoilers, superscript, tables, blockquotes)
* ✅ **Fetch any Reddit post by URL** via `/fetch` endpoint
* ✅ Image, video, and gallery embedding
* ✅ **Dark mode toggle** with localStorage persistence
* ✅ **Long-lasting sessions** (90 days with rolling expiration)
* ✅ Mobile-responsive design
* ✅ Sticky header navigation
* ✅ Enhanced UI with smooth transitions and hover effects
* ✅ Collapsible comment threads
* ✅ Clean, modern UI with Tailwind CSS

## 🧪 Future Enhancements

* [ ] Save "favorite" posts locally
* [ ] Comment voting filter (e.g., top 3 comments only)
* [ ] Offline mode (cached JSON browsing)
* [ ] RSS export (for your chosen subs)
* [ ] Search within your feed
* [ ] Filter by subreddit in feed view
* [ ] Keyboard shortcuts for navigation
* [ ] Multi-reddit support (combine multiple subreddits)

---