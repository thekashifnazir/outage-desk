import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";

const LOVABLE_AIG_RUN_ID_HEADER = "X-Lovable-AIG-Run-ID";

function createLovableAiGatewayRunIdFetch() {
  let runId: string | undefined;
  return {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      if (runId && !headers.has(LOVABLE_AIG_RUN_ID_HEADER)) {
        headers.set(LOVABLE_AIG_RUN_ID_HEADER, runId);
      }
      const response = await fetch(input, { ...init, headers });
      runId ??= response.headers.get(LOVABLE_AIG_RUN_ID_HEADER)?.trim() || undefined;
      return response;
    },
  };
}

export const claimsSchema = z.object({
  claims: z.array(
    z.object({
      id: z.string(),
      class: z.string(),
      statement: z.string(),
    }),
  ),
});

export async function askAstraForClaimsJson(): Promise<string> {
  const apiKey = process.env["LOVABLE_API_KEY"]!;
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    messages: [
      {
        role: "user",
        content:
          'Return a JSON object matching this shape exactly and nothing else: { "claims": [ { "id": "C-001", "class": "CONFIRMED", "statement": "one sentence" } ] }. Invent one plausible example claim. Output only the JSON object, no markdown, no explanation.',
      },
    ],
    output: Output.object({ schema: claimsSchema }),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return await result.text;
}
