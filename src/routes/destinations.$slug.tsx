import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { SiteFooter, SiteHeader } from "@/components/atlas/SiteChrome";
import { RemoteImage } from "@/components/atlas/RemoteImage";
import { WeatherCard } from "@/components/atlas/WeatherPanel";
import { AssistantChat, TripPlanner } from "@/components/atlas/TripPlanner";
import { getDestination, type Destination } from "@/lib/destinations";

export const Route = createFileRoute("/destinations/$slug")({
  loader: ({ params }) => {
    const destination = getDestination(params.slug);
    if (!destination) throw notFound();
    return { destination };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Destination not found — Atlas" }, { name: "robots", content: "noindex" }] };
    }
    const d = loaderData.destination;
    const title = `${d.name}, ${d.country} — Atlas travel guide`;
    const description = `${d.tagline}. Famous places, live weather and an AI-written day-by-day itinerary for ${d.name}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: DestinationNotFound,
  component: DestinationPage,
});

function DestinationNotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8">
        <p className="label-mono text-muted-foreground">Off the map</p>
        <h1 className="mt-4 font-display text-5xl tracking-tight">We don't cover that place yet</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Atlas is deliberately small. Head back to the index and pick one of the eight.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-85"
        >
          Back to destinations
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function DestinationPage() {
  const { destination } = Route.useLoaderData() as { destination: Destination };
  const place = {
    name: destination.name,
    country: destination.country,
    lat: destination.lat,
    lon: destination.lon,
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative isolate flex min-h-[62vh] items-end overflow-hidden">
          <RemoteImage
            wiki={destination.wiki}
            alt={`${destination.name}, ${destination.country}`}
            className="absolute inset-0 h-full w-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/35 to-ink/10" aria-hidden="true" />
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-28 sm:px-8">
            <p className="label-mono text-ink-foreground/70">
              {destination.region} · {destination.country}
            </p>
            <h1 className="mt-4 font-display text-6xl leading-[0.95] tracking-tight text-ink-foreground sm:text-8xl">
              {destination.name}
            </h1>
            <p className="mt-4 max-w-xl text-ink-foreground/85">{destination.tagline}</p>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.6fr_1fr] lg:py-24">
          <div>
            <p className="max-w-2xl font-display text-2xl leading-snug tracking-tight sm:text-3xl">
              {destination.blurb}
            </p>

            <dl className="mt-8 flex flex-wrap gap-3 text-sm">
              <div className="rounded-xl bg-secondary px-4 py-3">
                <dt className="label-mono text-muted-foreground">Best months</dt>
                <dd className="mt-1 font-medium">{destination.bestMonths}</dd>
              </div>
              <div className="rounded-xl bg-secondary px-4 py-3">
                <dt className="label-mono text-muted-foreground">Ideal length</dt>
                <dd className="mt-1 font-medium">{destination.idealDays} days</dd>
              </div>
              <div className="rounded-xl bg-secondary px-4 py-3">
                <dt className="label-mono text-muted-foreground">Known for</dt>
                <dd className="mt-1 font-medium">{destination.tags.join(" · ")}</dd>
              </div>
            </dl>

            <h2 className="mt-16 font-display text-4xl tracking-tight">Famous places</h2>
            <ul className="mt-8 grid gap-8 sm:grid-cols-2">
              {destination.places.map((p, i) => (
                <li key={p.wiki} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
                  <RemoteImage wiki={p.wiki} alt={p.name} className="aspect-[4/3] w-full rounded-2xl" />
                  <div className="mt-3 flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl tracking-tight">{p.name}</h3>
                    <span className="label-mono text-muted-foreground">{p.kind}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{p.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <WeatherCard place={place} />
          </aside>
        </div>

        <section className="border-t border-border bg-secondary/50">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.3fr_1fr]">
            <TripPlanner destination={destination} />
            <AssistantChat destination={destination} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
