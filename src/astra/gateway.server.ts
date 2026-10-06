import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import type { z } from "zod";

const RUN_ID = "X-Lovable-AIG-Run-ID";
const MODEL = "openai/gpt-6-astra";

function runIdFetch() {
  let runId: string | undefined;
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (runId && !headers.has(RUN_ID)) headers.set(RUN_ID, runId);
    const response = await fetch(input, { ...init, headers });
    runId ??= response.headers.get(RUN_ID)?.trim() || undefined;
    return response;
  };
}

/** Gateway/HTTP failure: terminal, never retried here. */
export class GatewayError extends Error {
  constructor(message: string, public status: number | null) {
    super(message);
  }
}

function gatewayError(error: unknown): GatewayError {
  const e = error as { statusCode?: number; message?: string; responseBody?: string };
  const status = typeof e?.statusCode === "number" ? e.statusCode : null;
  let message = e?.message ?? String(error);
  try {
    const body = e?.responseBody ? JSON.parse(e.responseBody) : null;
    message = body?.message ?? body?.error?.message ?? message;
  } catch {
    /* keep message */
  }
  if (status === 402) message = message || "Lovable AI credits are used up.";
  if (status === 429) message = message || "GPT-6 Astra is rate limited. Try again shortly.";
  return new GatewayError(message, status);
}

/**
 * One GPT-6 Astra step: stream the response, parse JSON, validate against the
 * schema and the step's code checks, and retry once with the problem stated.
 */
export async function callAstra<T>(
  prompt: string,
  schema: z.ZodType<T>,
  check: (value: T) => void,
  effort: "low" | "medium" = "low",
): Promise<{ value: T; attempts: number; seconds: number }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new GatewayError("Lovable AI is not configured (missing key).", 401);
  const start = Date.now();
  let issue = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: runIdFetch(),
    });
    let streamError: unknown = null;
    const result = streamText({
      model: provider.responses(MODEL),
      prompt: issue ? `${prompt}\n\nYour previous output was invalid: ${issue}. Return corrected JSON.` : prompt,
      output: Output.object({ schema }),
      onError: ({ error }) => {
        streamError = error;
      },
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: effort,
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
          strictJsonSchema: true,
        },
      },
    });
    let raw = "";
    try {
      raw = await result.text;
    } catch (error) {
      throw gatewayError(error);
    }
    if (streamError) throw gatewayError(streamError);
    try {
      const value = schema.parse(JSON.parse(raw));
      check(value);
      return { value, attempts: attempt, seconds: (Date.now() - start) / 1000 };
    } catch (error) {
      issue = error instanceof Error ? error.message.slice(0, 600) : String(error);
    }
  }
  throw new Error(`didn't return valid JSON after a retry (${issue})`);
}
