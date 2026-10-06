import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

import { testAstraJson, type AstraTestResult } from "@/lib/astra.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astra JSON Test" },
      {
        name: "description",
        content:
          "A minimal shell page that tests structured JSON output from the GPT-6 Astra model via Lovable AI.",
      },
      { property: "og:title", content: "Astra JSON Test" },
      {
        property: "og:description",
        content:
          "A minimal shell page that tests structured JSON output from the GPT-6 Astra model via Lovable AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const runTest = useServerFn(testAstraJson);
  const [result, setResult] = useState<AstraTestResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      setResult(await runTest());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-xl rounded-2xl border border-border bg-card p-8 shadow-2xl shadow-black/40">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Lovable AI
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
          Astra JSON Test
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Calls the GPT-6 Astra model and checks that it returns a parseable
          JSON object in the expected claims shape.
        </p>

        <button
          onClick={handleClick}
          disabled={pending}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Testing…" : "Test Astra JSON"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        {result && (
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg border border-border bg-muted p-4 text-xs leading-relaxed text-foreground">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </section>
    </main>
  );
}
