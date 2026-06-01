const youtubeHosts = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

export function getYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (!youtubeHosts.has(parsed.hostname) && !youtubeHosts.has(host)) {
      return null;
    }

    if (host === "youtu.be") {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (parsed.pathname === "/watch") {
      return parsed.searchParams.get("v");
    }

    const [, prefix, id] = parsed.pathname.split("/");
    if (["embed", "shorts", "live"].includes(prefix) && id) {
      return id;
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}
