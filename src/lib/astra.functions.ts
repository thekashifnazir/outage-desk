import { createServerFn } from "@tanstack/react-start";

import { askAstraForClaimsJson } from "./astra.server";

export type AstraTestResult =
  | { ok: true; json: unknown }
  | { ok: false; raw: string };

export const testAstraJson = createServerFn({ method: "POST" }).handler(
  async (): Promise<AstraTestResult> => {
    const text = await askAstraForClaimsJson();
    try {
      return { ok: true, json: JSON.parse(text) };
    } catch {
      return { ok: false, raw: text.slice(0, 200) };
    }
  },
);
