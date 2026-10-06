# outage-desk

Add a server function called test-astra-json that uses Lovable AI with the model

"GPT-6 Astra". It should ask the model to return a JSON object matching this shape

exactly and nothing else:

{ "claims": [ { "id": "C-001", "class": "CONFIRMED", "statement": "one sentence" } ] }

Validate that the response parses as JSON, and return

{ "ok": true, "json": <the model's JSON> } on success or

{ "ok": false, "raw": <first 200 chars of what came back> } on failure.

Add a button on the page labelled "Test Astra JSON" that calls it and shows the

result. Dark, minimal styling — this page becomes the app's shell.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ec9a401-cb85-4a9b-874b-e98291f1ce4b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
