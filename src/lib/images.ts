/**
 * Images are fetched at runtime from Wikimedia (Wikipedia REST API).
 * Nothing is hardcoded into the bundle — only page titles are.
 */

export type RemoteImage = {
  url: string;
  credit: string;
  source: string;
};

const WIKI = "https://en.wikipedia.org/api/rest_v1/page/summary/";

export async function fetchWikiImage(title: string, signal?: AbortSignal): Promise<RemoteImage | null> {
  const res = await fetch(WIKI + encodeURIComponent(title), {
    signal: signal ?? null,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Image lookup failed (${res.status})`);
  const data = (await res.json()) as {
    originalimage?: { source: string };
    thumbnail?: { source: string };
    content_urls?: { desktop?: { page?: string } };
    title?: string;
  };
  const raw = data.originalimage?.source ?? data.thumbnail?.source;
  if (!raw) return null;
  return {
    url: raw,
    credit: `Wikimedia Commons — ${data.title ?? title.replace(/_/g, " ")}`,
    source: data.content_urls?.desktop?.page ?? "",
  };
}

export const imageQuery = (title: string) => ({
  queryKey: ["wiki-image", title],
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchWikiImage(title, signal),
  staleTime: 1000 * 60 * 60,
  retry: 1,
});
