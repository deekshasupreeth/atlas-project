import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="font-display text-2xl leading-none tracking-tight">
          Atlas<span className="text-accent">.</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-6">
          <a href="/#explore" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Destinations
          </a>
          <a href="/#weather" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Weather
          </a>
          <a
            href="/#explore"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-85"
          >
            Plan a trip
          </a>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-display text-xl tracking-tight text-foreground">Atlas</p>
        <p>
          Weather by Open-Meteo · Photography from Wikimedia Commons · Itineraries written by AI
        </p>
      </div>
    </footer>
  );
}
