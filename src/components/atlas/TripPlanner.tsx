import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { askAssistant, planItinerary, type Itinerary } from "@/lib/assistant.functions";
import type { Destination } from "@/lib/destinations";

const PACES = [
  { id: "slow", label: "Slow" },
  { id: "balanced", label: "Balanced" },
  { id: "packed", label: "Packed" },
] as const;

const INTERESTS = ["Food", "History", "Nature", "Architecture", "Nightlife", "Photography"];

export function TripPlanner({ destination, weather }: { destination: Destination; weather?: string }) {
  const plan = useServerFn(planItinerary);
  const [days, setDays] = useState(destination.idealDays);
  const [pace, setPace] = useState<(typeof PACES)[number]["id"]>("balanced");
  const [interests, setInterests] = useState<string[]>(["Food"]);

  const mutation = useMutation<Itinerary, Error>({
    mutationFn: () =>
      plan({
        data: {
          destination: destination.name,
          country: destination.country,
          days,
          pace,
          interests,
          weather: weather ?? "",
          places: destination.places.map((p) => p.name),
        },
      }),
  });

  const toggle = (i: string) =>
    setInterests((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));

  return (
    <section id="itinerary" aria-labelledby="itinerary-heading" className="scroll-mt-24">
      <p className="label-mono text-muted-foreground">Itinerary</p>
      <h2 id="itinerary-heading" className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        Build the days
      </h2>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <form
          className="lg:col-span-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="rounded-2xl border border-border bg-card p-6">
            <fieldset>
              <legend className="label-mono text-muted-foreground">Length</legend>
              <div className="mt-3 flex items-center gap-4">
                <input
                  id="days"
                  type="range"
                  min={1}
                  max={10}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-sand accent-accent"
                />
                <span className="w-16 text-right text-sm font-medium">{days} days</span>
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="label-mono text-muted-foreground">Pace</legend>
              <div className="mt-3 flex gap-2">
                {PACES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={pace === p.id}
                    onClick={() => setPace(p.id)}
                    className={
                      "flex-1 rounded-full px-3 py-2 text-sm transition-colors " +
                      (pace === p.id
                        ? "bg-ink text-ink-foreground"
                        : "border border-input text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-6">
              <legend className="label-mono text-muted-foreground">Interests</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {INTERESTS.map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={interests.includes(i)}
                    onClick={() => toggle(i)}
                    className={
                      "rounded-full px-3 py-1.5 text-sm transition-colors " +
                      (interests.includes(i)
                        ? "bg-accent text-accent-foreground"
                        : "border border-input text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {i}
                  </button>
                ))}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="mt-7 w-full rounded-full bg-ink px-4 py-3 text-sm font-medium text-ink-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              {mutation.isPending ? "Drafting your days…" : "Generate itinerary"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-8">
          {mutation.isIdle && (
            <div className="grid h-full min-h-64 place-items-center rounded-2xl border border-dashed border-input px-6 py-12 text-center">
              <div>
                <p className="font-display text-2xl tracking-tight">No plan yet</p>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Set the length and pace, and the assistant will lay out {destination.name} day by day.
                </p>
              </div>
            </div>
          )}

          {mutation.isPending && (
            <div className="space-y-4" aria-live="polite">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6">
                  <div className="h-4 w-24 rounded skeleton-sheen" />
                  <div className="mt-4 h-6 w-2/3 rounded skeleton-sheen" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-full rounded skeleton-sheen" />
                    <div className="h-4 w-5/6 rounded skeleton-sheen" />
                  </div>
                </div>
              ))}
              <span className="sr-only">Generating your itinerary</span>
            </div>
          )}

          {mutation.isError && (
            <div className="rounded-2xl border border-destructive/30 bg-card p-6">
              <p className="font-medium text-destructive">That didn't work</p>
              <p className="mt-2 text-sm text-muted-foreground">{mutation.error.message}</p>
              <button
                type="button"
                onClick={() => mutation.mutate()}
                className="mt-4 rounded-full border border-input px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                Try again
              </button>
            </div>
          )}

          {mutation.isSuccess && <ItineraryView itinerary={mutation.data} />}
        </div>
      </div>
    </section>
  );
}

function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  return (
    <article className="animate-rise">
      <header className="rounded-2xl bg-ink px-6 py-5 text-ink-foreground">
        <h3 className="font-display text-3xl tracking-tight">{itinerary.headline}</h3>
        <p className="mt-2 text-sm opacity-80">{itinerary.note}</p>
      </header>

      <ol className="mt-4 space-y-4">
        {itinerary.days.map((day, i) => (
          <li
            key={day.day}
            className="animate-rise rounded-2xl border border-border bg-card p-6"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-mono text-accent">Day {String(day.day).padStart(2, "0")}</p>
              <p className="text-sm text-muted-foreground">{day.summary}</p>
            </div>
            <h4 className="mt-2 font-display text-2xl tracking-tight">{day.title}</h4>

            <ul className="mt-5 space-y-4 border-l border-border pl-5">
              {day.items.map((item, j) => (
                <li key={j} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[27px] top-1.5 size-2 rounded-full bg-accent"
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                    <time className="label-mono w-14 shrink-0 pt-1 text-muted-foreground">{item.time}</time>
                    <div>
                      <p className="font-medium">
                        {item.title}
                        <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          {item.kind}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}

type Message = { role: "user" | "assistant"; content: string };

export function AssistantChat({ destination }: { destination: Destination }) {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");

  const mutation = useMutation<{ reply: string }, Error, Message[]>({
    mutationFn: (history) => ask({ data: { destination: destination.name, history } }),
    onSuccess: (res) => setMessages((m) => [...m, { role: "assistant", content: res.reply }]),
  });

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setDraft("");
    mutation.mutate(next);
  };

  const suggestions = [
    `How long should I spend in ${destination.name}?`,
    "When is the best time of year to go?",
    "What should I skip?",
  ];

  return (
    <section id="ask" aria-labelledby="ask-heading" className="scroll-mt-24">
      <p className="label-mono text-muted-foreground">Ask</p>
      <h2 id="ask-heading" className="mt-3 font-display text-4xl tracking-tight sm:text-5xl">
        Talk it through
      </h2>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="max-h-96 space-y-4 overflow-y-auto" aria-live="polite">
          {messages.length === 0 && !mutation.isPending && (
            <p className="text-sm text-muted-foreground">
              Ask anything about {destination.name} — timing, pacing, what's overrated.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-sm text-ink-foreground"
                  : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm"
              }
            >
              {m.content}
            </div>
          ))}

          {mutation.isPending && (
            <div className="mr-auto flex max-w-[85%] gap-1.5 rounded-2xl rounded-bl-sm bg-secondary px-4 py-4">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="size-1.5 animate-pulse rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${d * 150}ms` }}
                />
              ))}
              <span className="sr-only">The assistant is typing</span>
            </div>
          )}

          {mutation.isError && (
            <p className="text-sm text-destructive">{mutation.error.message}</p>
          )}
        </div>

        {messages.length === 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="rounded-full border border-input px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <label htmlFor="ask-input" className="sr-only">
            Ask about {destination.name}
          </label>
          <input
            id="ask-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ask about ${destination.name}…`}
            className="h-11 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !draft.trim()}
            className="rounded-full bg-accent px-5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
