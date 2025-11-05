# Mini-Reddit Feature Guide

This document describes the new features added to Mini-Reddit.

## 🎨 Reddit-Flavored Markdown Support

All posts and comments now render proper Markdown formatting, including:

### Supported Markdown Features

- **Bold text**: `**bold**` or `__bold__`
- *Italic text*: `*italic*` or `_italic_`
- ***Bold and italic***: `***text***`
- ~~Strikethrough~~: `~~strikethrough~~`
- [Links](https://example.com): `[text](url)`
- `Inline code`: `` `code` ``
- Code blocks with syntax highlighting:
  ````
  ```python
  def hello():
      print("Hello, World!")
  ```
  ````
- > Blockquotes: `> quoted text`
- Lists (ordered and unordered)
- Tables
- Horizontal rules: `---`

### Reddit-Specific Markdown

- **Spoilers**: `>!spoiler text!<` - hover to reveal
- **Superscript**: `^(superscript text)` or `^word`
- **Nested lists** with proper indentation

### Examples

When you view a post or comment with this markdown:

```markdown
# Heading 1
## Heading 2

This is **bold** and this is *italic*.

Here's some `inline code` and a [link](https://reddit.com).

> This is a blockquote

- List item 1
- List item 2
  - Nested item

Here's a spoiler: >!Bruce Willis was dead the whole time!<

And some superscript: E = mc^2
```

It will render beautifully formatted!

---

## 🔗 Fetch Any Reddit Post

You can now view any Reddit post without leaving Mini-Reddit.

### How to Use

1. **Navigate to the Fetch page**: Click "🔗 Fetch Post" in the header, or go to `/fetch`
2. **Paste a Reddit URL**: Any of these formats work:
   - `https://reddit.com/r/soccer/comments/abc123/title/`
   - `https://www.reddit.com/r/chess/comments/xyz789/`
   - `https://old.reddit.com/r/galatasaray/comments/def456/post-title/`
   - `/r/programming/comments/ghi789/interesting-article/`
3. **Click "Fetch Post"**: The full post with all comments will load
4. **Enjoy**: Read the post and comments with full Markdown rendering

### Why Use This?

- **No context switching**: Stay in your Mini-Reddit interface
- **No ads or distractions**: Clean, focused reading experience
- **Works with any subreddit**: Even ones not in your subscribed list
- **Full feature set**: Comments, media, markdown all work perfectly

### Example URLs to Try

```
https://reddit.com/r/chess/comments/18q4dku/magnus_carlsen_announces_retirement/
https://reddit.com/r/soccer/comments/18nxp91/post_match_thread/
https://reddit.com/r/technology/comments/18k2nrp/new_breakthrough_announced/
```

---

## 🔐 Extended Session Duration

Sessions now last **90 days** instead of 30 days.

### How It Works

- **Rolling expiration**: Every time you visit the site, your session extends by another 90 days
- **Secure cookies**: All cookies are httpOnly and secure in production
- **No manual re-login needed**: In most browsers, you'll stay logged in for months

### Benefits

- Less frequent logins
- Better user experience
- Still secure with proper cookie settings

---

## 🎨 UI Improvements

### Enhanced Visual Design

- **Smooth transitions**: All interactive elements have subtle animations
- **Better hover states**: Cards lift slightly on hover
- **Improved typography**: Better line-height and spacing for readability
- **Enhanced focus states**: Better keyboard navigation visibility

### Dark Mode

- **Toggle button**: Click the 🌙/☀️ icon in the header
- **Persistent preference**: Your choice is saved in localStorage
- **System detection**: Automatically uses your system preference on first visit
- **Smooth transitions**: No jarring flashes when switching themes

### Accessibility

- **Keyboard navigation**: Full keyboard support for all features
- **Focus indicators**: Clear outlines for focused elements
- **Screen reader friendly**: Proper ARIA labels
- **Reduced motion**: Respects user's motion preferences

### Mobile Optimizations

- **Responsive design**: Adapts perfectly to all screen sizes
- **Touch-friendly**: Larger tap targets on mobile
- **Optimized scrolling**: Smooth performance on mobile devices
- **Readable text**: Proper font scaling for small screens

---

## 📝 Markdown Rendering Examples

### Post with Code

```markdown
Here's how to fetch data in JavaScript:

```javascript
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}
```

Easy, right?
```

### Comment with Formatting

```markdown
I **strongly** disagree! Here's why:

1. First reason with *emphasis*
2. Second reason with [proof](https://example.com)
3. Third reason with `code example`

> As Einstein once said...

Don't forget about ^(this tiny detail) !
```

### Spoiler Example

```markdown
The movie was amazing! >!But the ending was predictable.!<

Did you see it yet?
```

---

## 🚀 Quick Start

1. **Login**: Use the credentials from your `.env` file
2. **Add subreddits**: Type a subreddit name and click "Add"
3. **Browse feed**: See posts from all your subscribed subreddits
4. **View posts**: Click any post to see full content with comments
5. **Fetch external posts**: Use the "🔗 Fetch Post" link to view any Reddit post
6. **Toggle dark mode**: Click the theme toggle in the header
7. **Enjoy**: Read Reddit content without distractions!

---

## 🔧 Technical Details

### Markdown Parser

- Uses `marked` library (v16.4.1)
- Custom renderer for Reddit-specific features
- XSS protection with sanitization
- Supports GitHub Flavored Markdown (GFM)

### Session Management

- Fastify session with secure cookie storage
- 90-day expiration with rolling updates
- Secure, httpOnly, and SameSite=lax cookies

### Performance

- Server-side markdown parsing (faster initial render)
- 30-minute cache for Reddit API calls
- Minimal JavaScript for better performance
- Optimized images with lazy loading

---

## 💡 Tips & Tricks

### Viewing Comments

- **Collapse threads**: Click the ▼ arrow next to any username to collapse that comment and all replies
- **Score colors**: High-scoring comments (>100) are highlighted in orange
- **Thread depth**: Nested comments show visual threading with colored borders

### Navigation

- **Back to feed**: Click "Mini-Reddit" logo in any page header
- **Subreddit pages**: Click "r/subreddit" name to see just that sub
- **All feed**: Click "🏠 All Feed" in the sidebar

### Keyboard Shortcuts (Browser Native)

- `Ctrl+F` / `Cmd+F`: Search within page
- `Space`: Scroll down
- `Shift+Space`: Scroll up
- `Home`: Go to top
- `End`: Go to bottom

---

## 🐛 Troubleshooting

### Markdown not rendering?

- Check that you're using the latest version
- Clear your browser cache
- Restart the server

### Session keeps expiring?

- Check if cookies are enabled in your browser
- Make sure `SESSION_SECRET` is set in `.env`
- Verify `trustProxy: true` is set if behind a reverse proxy

### Fetch post not working?

- Verify the Reddit URL is correct
- Check that the post hasn't been deleted
- Try accessing the post directly on Reddit first

---

## 📚 Resources

- [Markdown Guide](https://www.markdownguide.org/)
- [Reddit Markdown Primer](https://www.reddit.com/wiki/markdown)
- [Fastify Documentation](https://www.fastify.io/docs/)
- [Marked.js](https://marked.js.org/)

---

**Enjoy your improved Mini-Reddit experience!** 🎉

