# Validation Plan

## Automated

- `dotnet test CampaignStudio.sln` — validation, Responses payload parsing, and deterministic server logic.
- `npm test` in `src/CampaignStudio.Web/ClientApp` — UI contract and required controls.
- `npm run build` in the web client — TypeScript and production bundle.
- `npm run build` in `mcp` — MCP schemas, view typing, and production bundle.
- `npm test` in `cli` — help, JSON-safe stdout, and exit behavior.

## Manual

1. Start the API with a server-side `OPENAI_API_KEY` and verify `/health` without calling OpenAI.
2. Submit a valid brief and confirm exactly three copy variants, ordered checklist, two image directions, image status, and readiness values.
3. Confirm browser network requests target only the Campaign Studio origin.
4. Temporarily remove the key and verify an actionable Problem Details response without secret leakage.
5. Force one image failure and verify the text package remains usable with `partial` status.
6. Check keyboard focus, screen-reader labels, reduced motion, 1440px desktop, 768px tablet, and 390px mobile.
7. Publish to IIS, enable HTTPS, recycle the app pool, and repeat the health and generation smoke tests.

No automated test should require a live OpenAI request. Live generation is a separately authorized smoke test because it incurs API usage.

