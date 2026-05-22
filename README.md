# YouTube Comment Finder

Search any public YouTube video's comments by keyword. Results stream in real time via Server-Sent Events — no YouTube Data API key required.

## Stack

- **Next.js** (App Router) — frontend + API routes
- **JavaScript** — no TypeScript
- **Tailwind CSS** — styling
- **[youtubei.js](https://github.com/LuanRT/YouTube.js)** — Innertube client (no quota)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a YouTube URL, enter a keyword, and click **Search comments**.

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/video?id=VIDEO_ID` | Video title, thumbnail, comment count |
| `GET /api/search?videoId=…&q=…&sort=newest\|top` | SSE stream: `match`, `progress`, `done`, `failed` |

## Deploy (Vercel)

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Deploy — **no environment variables** required

Search routes use `runtime = nodejs` and `maxDuration = 60` for streaming within hobby limits.

## License

MIT
