import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteHeader, SiteFooter } from "@/components/atlas/SiteChrome";
import { RemoteImage } from "@/components/atlas/RemoteImage";
import {
  LocationPrompt,
  PlaceSearch,
  WeatherCard,
  useLocalPlace,
} from "@/components/atlas/WeatherPanel";
import { allTags, destinations } from "@/lib/destinations";
import { heroVideoQuery } from "@/lib/video";
import { cn } from "@/lib/utils";

const TITLE = "Atlas — Editorial travel guides, live weather, AI itineraries";
const DESCRIPTION =
  "Browse eight considered destinations, check live conditions anywhere in the world, and have a day-by-day itinerary written for you.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function HeroVideo() {
  const { data, isPending, isError } = useQuery(
    heroVideoQuery("Aerial views of the coasts of Mallorca, Spain.webm"),
  );

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink" aria-hidden="true">
      {(isPending || isError || !data) && (
        <RemoteImage wiki="Mallorca" alt="" className="h-full w-full" priority />
      )}
      {data && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover animate-fade"
        >
          {data.sources.map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      )}
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/85 to-transparent" />
    </div>
  );
}

function Hero({ onSearch }: { onSearch: (term: string) => void }) {
  const [term, setTerm] = useState("");

  return (
    <section className="relative isolate flex min-h-[85vh] items-end overflow-hidden">
      <HeroVideo />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-24">
        <p className="label-mono animate-fade text-ink-foreground/70">Eight places, properly considered</p>
        <h1 className="mt-5 max-w-3xl animate-rise font-display text-5xl leading-[0.95] tracking-tight text-ink-foreground sm:text-7xl md:text-8xl">
          Go somewhere you'll still be thinking about in ten years.
        </h1>
        <p className="mt-6 max-w-xl animate-rise text-base text-ink-foreground/80 sm:text-lg">
          {DESCRIPTION}
        </p>

        <form
          className="mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(term);
            document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <label htmlFor="hero-search" className="sr-only">
            Search destinations
          </label>
          <input
            id="hero-search"
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Kyoto, coastlines, mole and mezcal…"
            className="h-12 flex-1 rounded-full border border-ink-foreground/25 bg-background/95 px-5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <button
            type="submit"
            className="h-12 rounded-full bg-accent px-6 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Explore
          </button>
        </form>
      </div>
    </section>
  );
}

function DestinationCard({
  slug,
  name,
  country,
  tagline,
  wiki,
  tall,
  index,
}: {
  slug: string;
  name: string;
  country: string;
  tagline: string;
  wiki: string;
  tall: boolean;
  index: number;
}) {
  return (
    <Link
      to="/destinations/$slug"
      params={{ slug }}
      className="group block animate-rise"
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <RemoteImage
        wiki={wiki}
        alt={`${name}, ${country}`}
        className={cn("w-full rounded-2xl", tall ? "aspect-[3/4]" : "aspect-[4/3]")}
        imgClassName="group-hover:scale-[1.04]"
      />
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-2xl leading-none tracking-tight">{name}</h3>
        <span className="label-mono text-muted-foreground">{country}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{tagline}</p>
    </Link>
  );
}

function Explorer({ term, setTerm }: { term: string; setTerm: (v: string) => void }) {
  const [active, setActive] = useState<string[]>([]);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    return destinations.filter((d) => {
      const matchesText =
        q.length === 0 ||
        [d.name, d.country, d.region, d.tagline, d.blurb, ...d.tags].join(" ").toLowerCase().includes(q);
      const matchesTags = active.length === 0 || active.every((t) => d.tags.includes(t as never));
      return matchesText && matchesTags;
    });
  }, [term, active]);

  const toggle = (tag: string) =>
    setActive((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));

  return (
    <section id="explore" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-col gap-6 border-b border-border pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label-mono text-muted-foreground">The index</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">Destinations</h2>
        </div>
        <div className="w-full md:max-w-xs">
          <label htmlFor="explore-search" className="sr-only">
            Filter destinations
          </label>
          <input
            id="explore-search"
            type="search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by name, country or mood"
            className="h-11 w-full rounded-full border border-input bg-card px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {allTags.map((tag) => {
          const on = active.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(tag)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                on
                  ? "border-transparent bg-ink text-ink-foreground"
                  : "border-input text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tag}
            </button>
          );
        })}
        {(active.length > 0 || term) && (
          <button
            type="button"
            onClick={() => {
              setActive([]);
              setTerm("");
            }}
            className="label-mono px-2 py-1.5 text-muted-foreground underline-offset-4 hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-input px-6 py-16 text-center">
          <p className="font-display text-3xl tracking-tight">Nothing matches that yet</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Atlas is deliberately small — eight places, chosen carefully. Try a broader word, or clear the
            filters to see everything.
          </p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d, i) => (
            <div key={d.slug} className={cn(i % 5 === 0 && "lg:row-span-2")}>
              <DestinationCard
                slug={d.slug}
                name={d.name}
                country={d.country}
                tagline={d.tagline}
                wiki={d.wiki}
                tall={i % 5 === 0}
                index={i}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function LocalWeather() {
  const { place, setPlace, status, request } = useLocalPlace();

  return (
    <section id="weather" className="scroll-mt-20 border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="label-mono text-muted-foreground">Before you pack</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
            What the sky is doing, right now.
          </h2>
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            Live conditions and a five-day outlook for wherever you are — or anywhere you're curious about.
            No account, no key, no tracking.
          </p>
          <div className="mt-6 space-y-4">
            <PlaceSearch onSelect={setPlace} label="Search any city or island" />
            <LocationPrompt status={status} onRequest={request} />
          </div>
        </div>
        <WeatherCard place={place} className="self-start" />
      </div>
    </section>
  );
}

function Index() {
  const [term, setTerm] = useState("");

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero onSearch={setTerm} />
        <Explorer term={term} setTerm={setTerm} />
        <LocalWeather />
      </main>
      <SiteFooter />
    </div>
  );
}
