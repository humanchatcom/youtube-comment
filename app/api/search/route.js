import { streamComments } from "@/lib/youtube";

export const runtime = "nodejs";
export const maxDuration = 60;

const SORT_MAP = {
  newest: "NEWEST_FIRST",
  top: "TOP_COMMENTS",
  NEWEST_FIRST: "NEWEST_FIRST",
  TOP_COMMENTS: "TOP_COMMENTS",
};

/** @param {ReadableStreamDefaultController<Uint8Array>} ctrl */
function createSender(ctrl) {
  const enc = new TextEncoder();
  return (event, data) => {
    ctrl.enqueue(
      enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
    );
  };
}

/** @param {Request} req */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");
  const q = (searchParams.get("q") || "").trim();
  const sortKey = searchParams.get("sort") || "newest";

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return Response.json({ error: "Invalid video ID" }, { status: 400 });
  }

  if (!q) {
    return Response.json({ error: "Keyword is required" }, { status: 400 });
  }

  const sort = SORT_MAP[sortKey] ?? "NEWEST_FIRST";
  const needle = q.toLowerCase();

  const stream = new ReadableStream({
    async start(ctrl) {
      const send = createSender(ctrl);
      let scanned = 0;
      let matched = 0;

      try {
        for await (const comment of streamComments(videoId, { sort })) {
          scanned++;
          if (comment.text.toLowerCase().includes(needle)) {
            matched++;
            send("match", comment);
          }
          if (scanned % 50 === 0) {
            send("progress", { scanned, matched });
          }
        }
        send("done", { scanned, matched });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Search failed unexpectedly";
        const friendly = message.toLowerCase().includes("comments")
          ? "Comments are disabled or unavailable on this video."
          : message;
        send("failed", { message: friendly });
      } finally {
        ctrl.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
