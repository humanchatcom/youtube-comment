import { getVideoMeta } from "@/lib/youtube";
import { parseVideoId } from "@/lib/parseVideoId";

export const runtime = "nodejs";

/** @param {Request} req */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") ?? searchParams.get("videoId");
  const videoId = id ? parseVideoId(id) ?? id : null;

  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
    return Response.json({ error: "Invalid video ID or URL" }, { status: 400 });
  }

  try {
    const meta = await getVideoMeta(videoId);
    return Response.json(meta);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load video metadata";
    return Response.json({ error: message }, { status: 500 });
  }
}
