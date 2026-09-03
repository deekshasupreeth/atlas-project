/**
 * Hero video is fetched at runtime from Wikimedia Commons.
 * Only the file title is in the bundle; the playable renditions come from the API.
 */

export type VideoSource = { src: string; type: string };

export type CommonsVideo = {
  sources: VideoSource[];
  credit: string;
  page: string;
};

export async function fetchCommonsVideo(
  fileTitle: string,
  signal?: AbortSignal,
): Promise<CommonsVideo | null> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*` +
    `&titles=${encodeURIComponent("File:" + fileTitle)}&prop=videoinfo&viprop=url%7Cderivatives`;
  const res = await fetch(url, { signal: signal ?? null });
  if (!res.ok) throw new Error(`Video lookup failed (${res.status})`);
  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          videoinfo?: Array<{
            descriptionurl?: string;
            derivatives?: Array<{ src: string; type: string; transcodekey?: string; height?: number }>;
          }>;
        }
      >;
    };
  };
  const page = Object.values(data.query?.pages ?? {})[0];
  const info = page?.videoinfo?.[0];
  const derivatives = info?.derivatives ?? [];
  if (derivatives.length === 0) return null;

  const pick = (key: string) => derivatives.find((d) => d.transcodekey === key);
  const ordered = [pick("720p.vp9.webm"), pick("480p.vp9.webm"), pick("360p.mpeg4.mov"), pick("240p.vp9.webm")]
    .filter(Boolean)
    .map((d) => ({ src: d!.src, type: d!.type.split(";")[0] ?? "video/webm" }));

  if (ordered.length === 0) return null;

  return {
    sources: ordered,
    credit: `Wikimedia Commons — ${fileTitle.replace(/_/g, " ").replace(/\.[a-z0-9]+$/i, "")}`,
    page: info?.descriptionurl ?? "",
  };
}

export const heroVideoQuery = (fileTitle: string) => ({
  queryKey: ["commons-video", fileTitle],
  queryFn: ({ signal }: { signal: AbortSignal }) => fetchCommonsVideo(fileTitle, signal),
  staleTime: 1000 * 60 * 60,
  retry: 1,
});
