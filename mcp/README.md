# Campaign Studio MCP App

Skybridge MCP development surface for the Campaign Studio ASP.NET Core application.

## Tools

- `validate_campaign_brief` checks completeness and field limits without generation.
- `generate_campaign_package` creates a stored package through the ASP.NET API and renders the compact React view.
- `get_campaign_package` retrieves a stable result by ID.

The MCP process never calls OpenAI directly. Set `CAMPAIGN_STUDIO_API_URL` to the ASP.NET origin (default `http://127.0.0.1:5208`). For remote internal access, set `CAMPAIGN_STUDIO_TOKEN` to the bearer token expected by the ASP.NET deployment.

The MCP endpoint is anonymous by default for loopback development. Set `MCP_BEARER_TOKEN` before startup to require a static bearer token for remote internal testing. Use OAuth 2.1 instead before public distribution.

```bash
npm ci
npm run dev
```

The MCP endpoint is `http://127.0.0.1:3000/mcp`; local Skybridge DevTools runs at `http://127.0.0.1:3000`.
