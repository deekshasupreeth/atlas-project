import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

const chatInput = z.object({
  destination: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) }))
    .max(20),
});

const itineraryInput = z.object({
  destination: z.string().min(1),
  country: z.string().default(""),
  days: z.number().int().min(1).max(10),
  pace: z.enum(["slow", "balanced", "packed"]),
  interests: z.array(z.string()).max(8).default([]),
  weather: z.string().default(""),
  places: z.array(z.string()).max(20).default([]),
});

export type ItineraryDay = {
  day: number;
  title: string;
  summary: string;
  items: Array<{ time: string; title: string; detail: string; kind: string }>;
};

export type Itinerary = {
  destination: string;
  headline: string;
  note: string;
  days: ItineraryDay[];
};

async function callGateway(body: unknown) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("The assistant is not configured right now.");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  if (res.status === 429) throw new Error("The assistant is busy — try again in a moment.");
  if (res.status === 402) throw new Error("The assistant is out of credits for now.");
  if (!res.ok) throw new Error(`The assistant could not answer (${res.status}).`);
  return (await res.json()) as {
    choices?: Array<{ message?: { content?: string; tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
  };
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatInput.parse(data))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const json = await callGateway({
      model: MODEL,
      reasoning_effort: "none",
      messages: [
        {
          role: "system",
          content:
            `You are the travel desk for Atlas, an editorial travel guide. The traveller is asking about ${data.destination}. ` +
            "Answer in at most 120 words, plain prose, no markdown headings, no bullet lists longer than three items. " +
            "Be specific and opinionated: name places, months, and rough timings. If asked something unrelated to travel, redirect politely.",
        },
        ...data.history,
      ],
    });
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("The assistant returned an empty answer.");
    return { reply };
  });

export const planItinerary = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => itineraryInput.parse(data))
  .handler(async ({ data }): Promise<Itinerary> => {
    const json = await callGateway({
      model: MODEL,
      reasoning_effort: "none",
      messages: [
        {
          role: "system",
          content:
            "You build precise, realistic day-by-day travel itineraries. Group activities geographically so a day doesn't zig-zag across a city. " +
            "Always call the build_itinerary tool. Use 3 to 5 items per day including one meal suggestion. Times in 24h format.",
        },
        {
          role: "user",
          content:
            `Plan ${data.days} days in ${data.destination}${data.country ? ", " + data.country : ""}. ` +
            `Pace: ${data.pace}. ` +
            (data.interests.length ? `Interests: ${data.interests.join(", ")}. ` : "") +
            (data.weather ? `Current conditions: ${data.weather}. Adapt outdoor timing to it. ` : "") +
            (data.places.length ? `Notable places worth including: ${data.places.join(", ")}.` : ""),
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "build_itinerary",
            description: "Return a structured day-by-day itinerary.",
            parameters: {
              type: "object",
              properties: {
                headline: { type: "string", description: "Short editorial title for the trip" },
                note: { type: "string", description: "One sentence of practical advice" },
                days: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      day: { type: "number" },
                      title: { type: "string" },
                      summary: { type: "string" },
                      items: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            time: { type: "string" },
                            title: { type: "string" },
                            detail: { type: "string" },
                            kind: { type: "string", description: "One of: sight, walk, food, transport, rest" },
                          },
                          required: ["time", "title", "detail", "kind"],
                          additionalProperties: false,
                        },
                      },
                    },
                    required: ["day", "title", "summary", "items"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["headline", "note", "days"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "build_itinerary" } },
    });

    const raw = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!raw) throw new Error("The assistant could not build a plan. Try again.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("The assistant returned a malformed plan. Try again.");
    }

    const shape = z.object({
      headline: z.string(),
      note: z.string(),
      days: z.array(
        z.object({
          day: z.number(),
          title: z.string(),
          summary: z.string(),
          items: z.array(
            z.object({ time: z.string(), title: z.string(), detail: z.string(), kind: z.string() }),
          ),
        }),
      ),
    });
    const result = shape.parse(parsed);
    return { destination: data.destination, ...result };
  });
