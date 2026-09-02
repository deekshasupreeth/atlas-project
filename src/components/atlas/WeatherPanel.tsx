import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchWeather, reverseLookup, searchPlaces, type GeoPlace } from "@/lib/weather";
import { cn } from "@/lib/utils";

type PermissionState = "idle" | "asking" | "granted" | "denied" | "unsupported";

export function useLocalPlace(fallback?: GeoPlace) {
  const [place, setPlace] = useState<GeoPlace | null>(fallback ?? null);
  const [status, setStatus] = useState<PermissionState>("idle");

  const request = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const found = await reverseLookup(pos.coords.latitude, pos.coords.longitude);
        setPlace(found);
        setStatus("granted");
      },
      () => setStatus("denied"),
      { timeout: 10000 },
    );
  };

  return { place, setPlace, status, request };
}

export function PlaceSearch({
  onSelect,
  label = "Search a location",
}: {
  onSelect: (p: GeoPlace) => void;
  label?: string;
}) {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(t);
  }, [term]);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["geo", debounced],
    queryFn: ({ signal }) => searchPlaces(debounced, signal),
    enabled: debounced.trim().length >= 2,
  });

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label htmlFor="place-search" className="sr-only">
        {label}
      </label>
      <input
        id="place-search"
        type="search"
        value={term}
        placeholder={label}
        autoComplete="off"
        onChange={(e) => {
          setTerm(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />
      {open && debounced.trim().length >= 2 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          {isFetching && <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>}
          {isError && <p className="px-4 py-3 text-sm text-destructive">Search failed. Try again.</p>}
          {!isFetching && !isError && data?.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No place matches “{debounced}”.</p>
          )}
          <ul>
            {data?.map((p) => (
              <li key={`${p.lat},${p.lon}`}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(p);
                    setTerm("");
                    setOpen(false);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {[p.admin, p.country].filter(Boolean).join(", ")}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function WeatherCard({
  place,
  compact = false,
  className,
}: {
  place: GeoPlace | null;
  compact?: boolean;
  className?: string;
}) {
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ["weather", place?.lat, place?.lon],
    queryFn: ({ signal }) => fetchWeather(place!.lat, place!.lon, signal),
    enabled: !!place,
    staleTime: 1000 * 60 * 10,
  });

  if (!place) {
    return (
      <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
        <p className="label-mono text-muted-foreground">Live weather</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Choose a location to see current conditions.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border border-border bg-card p-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-mono text-muted-foreground">Live weather</p>
        <p className="truncate text-sm font-medium">
          {place.name}
          {place.country ? `, ${place.country}` : ""}
        </p>
      </div>

      {isPending && (
        <div className="mt-5 space-y-3" aria-live="polite">
          <div className="h-14 w-32 rounded-lg skeleton-sheen" />
          <div className="h-4 w-40 rounded skeleton-sheen" />
          <span className="sr-only">Loading current conditions</span>
        </div>
      )}

      {isError && (
        <div className="mt-5">
          <p className="text-sm text-destructive">{(error as Error).message}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-full border border-input px-4 py-1.5 text-sm transition-colors hover:bg-secondary"
          >
            Try again
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="mt-5 flex items-end gap-3">
            <span className="font-display text-6xl leading-none tracking-tight">{data.temperature}°</span>
            <span className="pb-2 text-sm text-muted-foreground">feels {data.feelsLike}°</span>
          </div>
          <p className="mt-2 text-sm">
            {data.summary} · {data.isDay ? "daylight" : "after dark"}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg bg-secondary px-3 py-2">
              <dt className="label-mono text-muted-foreground">Wind</dt>
              <dd className="mt-0.5 font-medium">{data.windSpeed} km/h</dd>
            </div>
            <div className="rounded-lg bg-secondary px-3 py-2">
              <dt className="label-mono text-muted-foreground">Humidity</dt>
              <dd className="mt-0.5 font-medium">{data.humidity}%</dd>
            </div>
          </dl>

          {!compact && (
            <ul className="mt-5 grid grid-cols-5 gap-2 border-t border-border pt-4 text-center">
              {data.daily.map((d) => (
                <li key={d.date}>
                  <p className="label-mono text-muted-foreground">
                    {new Date(d.date).toLocaleDateString("en", { weekday: "short" })}
                  </p>
                  <p className="mt-1 text-sm font-medium">{d.max}°</p>
                  <p className="text-xs text-muted-foreground">{d.min}°</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export function LocationPrompt({
  status,
  onRequest,
}: {
  status: PermissionState;
  onRequest: () => void;
}) {
  if (status === "granted") return null;

  return (
    <div className="rounded-2xl border border-dashed border-input bg-card p-6">
      <p className="label-mono text-muted-foreground">Where are you?</p>
      {status === "denied" && (
        <p className="mt-3 text-sm text-muted-foreground">
          Location access was declined — no problem. Search for a place instead and everything still works.
        </p>
      )}
      {status === "unsupported" && (
        <p className="mt-3 text-sm text-muted-foreground">
          This browser can't share a location. Search for a place instead.
        </p>
      )}
      {(status === "idle" || status === "asking") && (
        <p className="mt-3 text-sm text-muted-foreground">
          Share your location for local conditions, or search for anywhere in the world.
        </p>
      )}
      {status !== "denied" && status !== "unsupported" && (
        <button
          type="button"
          onClick={onRequest}
          disabled={status === "asking"}
          className="mt-4 rounded-full bg-ink px-4 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {status === "asking" ? "Locating…" : "Use my location"}
        </button>
      )}
    </div>
  );
}
