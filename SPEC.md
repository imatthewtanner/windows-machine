# Campaign Studio — Product and MCP Specification

## Value Proposition

Campaign Studio turns a short marketing brief into a usable campaign direction for campaign creators, while giving developers and Codex a focused MCP surface for validating and testing the generation workflow.

**Primary web user:** In-house and agency campaign creators who need a coherent starting point quickly.

**Primary MCP user:** Developers and Codex agents testing campaign prompts, payloads, and generated results.

**Pain addressed:** Producing a concept, channel-ready copy, a launch checklist, and visual direction currently requires repeated prompt construction, multiple tools, and manual result assembly.

**Core MCP actions:**

1. Validate a campaign brief and identify actionable gaps.
2. Generate a complete campaign package through the ASP.NET server.
3. Inspect and export the latest result for development verification.

## Why an LLM

**Conversational advantage:** A developer can describe a campaign test naturally instead of manually assembling a complex request payload.

**LLM contribution:** Interpret intent, identify missing context, synthesize a concise campaign concept, produce structured copy and checklist content, and create campaign-ready image prompts.

**External capabilities required:** Product facts and brand rules come from tool inputs. The ASP.NET service owns OpenAI access, structured generation, image generation, validation, storage, and errors.

This is a focused MCP workflow, not a port of the full website or dashboard.

## Web Application Journey

1. The user enters a campaign brief, target audience, product details, tone, and desired channels.
2. The client validates required fields locally and submits one request to the ASP.NET API.
3. The server uses the OpenAI Responses API for structured campaign text and the Responses image-generation tool for campaign imagery.
4. The UI presents a concise concept, three headline/body variants, a launch checklist, image prompts, generated images, and a channel-coverage visualization.
5. Empty, loading, partial-success, validation, and server-error states remain actionable.

## MCP UI Journey

**First view:** A compact brief summary with completeness indicators and missing-field guidance.

**Interactions:** Validate the brief, generate the campaign package, inspect the campaign concept, copy variants, checklist, image prompts, generated-image status, and generation metadata.

**End state:** A structured result that can be exported for development verification. Credentials never enter the MCP view or model context.

## Product Context

- **Product:** A new ASP.NET Core application deployable beneath the IIS Default Web Site on Windows Server 2022.
- **OpenAI integration:** Server-side Responses API only; no legacy Completions or Chat Completions implementation.
- **MCP integration:** A Skybridge development app calls the internal ASP.NET endpoints and never calls OpenAI directly.
- **Development authentication:** No authentication for loopback-only local development.
- **Remote MCP authentication:** Optional bearer token when MCP access is enabled outside loopback.
- **Production transport:** HTTPS through IIS.
- **Secrets:** `OPENAI_API_KEY` and any MCP bearer token remain server-side and are never committed or returned to clients.
- **Generated images:** Stored in controlled application storage and served through application-owned URLs.

## Client/Server Boundary

### Browser owns

- Form state and accessible client-side validation
- Loading, empty, partial-success, success, and error presentation
- Rendering returned campaign content and channel coverage
- Copy/download interactions for non-secret generated artifacts

### ASP.NET server owns

- Authoritative input validation and request limits
- OpenAI Responses API and image-generation calls
- Prompt construction and structured-output schema
- Model, reasoning, image quality, image count, and timeout settings
- Safe persistence and serving of generated images
- Request correlation, logging, health checks, rate limiting, and Problem Details errors

### MCP development app owns

- Tool schemas optimized for developers and agents
- Calling the ASP.NET API through a configured base URL
- Compact view state and development-oriented result export
- Redaction of credentials and sensitive server configuration

## MCP Tool Contract

### `validate_campaign_brief`

Read-only validation. Accepts brief, audience, product details, tone, and channels. Returns completeness, field-level issues, and recommended corrections.

### `generate_campaign_package`

Consequential generation action. Accepts a validated campaign brief and requests a complete package from the ASP.NET service. Returns a result identifier, status, structured campaign content, image status, and non-secret metadata.

### `get_campaign_package`

Reads one result by stable identifier. Returns the current text/image state and export-ready structured data.

## Input Contract

- `brief`: required short campaign objective and offer
- `targetAudience`: required audience description
- `productDetails`: required facts, differentiators, and constraints
- `tone`: required controlled selection or short custom value
- `channels`: one or more desired channels

Inputs are length-limited, trimmed, treated as untrusted text, and never interpolated into system-level instructions.

## Campaign Output Contract

- Concise campaign concept with name, central idea, and strategic rationale
- Exactly three headline/body-copy variants
- Ordered launch checklist with completion-ready items
- Image prompt for each requested campaign image direction
- Generated image records with URL, prompt, dimensions/status, and recoverable errors
- Channel coverage values derived deterministically from returned deliverables
- Non-secret generation metadata and correlation identifier

## Data Visualization

**Analytical job:** Compare readiness across requested channels.

**Primary artifact:** Direct-labeled horizontal readiness bars, derived from the presence of channel-specific copy, checklist coverage, and image direction.

**Fallback:** Accessible table with the same channel, readiness score, and evidence labels.

Essential values remain visible without hover. Mobile uses the same reading order with larger tap targets and no horizontal overflow.

## Security and Operational Constraints

- API keys never appear in browser bundles, HTML, logs, MCP tool results, or source control.
- IIS terminates HTTPS; forwarded headers are accepted only from configured proxies.
- Request-size limits, rate limiting, cancellation, and timeouts protect generation endpoints.
- Errors use RFC-compatible Problem Details without upstream secret leakage.
- Generated image filenames are server-created identifiers, never user-provided paths.
- Health checks do not call OpenAI and do not expose secret/configuration values.

## Configuration Points

- Text model and reasoning effort
- System/developer prompt templates
- Structured-output schema version
- Image tool model selection behavior, quality, size, and count
- Storage root and retention policy
- OpenAI timeout and retry policy
- MCP base URL and optional bearer token

## Non-Goals

- Publishing directly to advertising or social platforms
- Customer/CRM data ingestion
- Multi-user campaign history, approval workflows, or billing
- Exposing the full website UI through MCP
- Allowing model-directed filesystem or shell access

## Acceptance Criteria

- Runs locally and builds with the selected stable .NET SDK.
- Publishes successfully for IIS on Windows Server 2022.
- Uses current OpenAI Responses API patterns for text and image generation.
- Browser network traffic contains no OpenAI credentials or direct OpenAI requests.
- Required success, empty, loading, validation, partial-image, and server-error states are implemented.
- MCP tools validate schemas and call only the configured ASP.NET service.
- Desktop and mobile layouts pass visual and accessibility checks.
- Unit/integration tests cover validation, JSON parsing, error mapping, and server boundary behavior without requiring live API calls.
- README documents installation, local run, environment configuration, architecture boundary, validation, tuning points, and IIS deployment.

## Approved Visual Contract

- Desktop reference: `docs/design/campaign-studio-desktop.png`
- Mobile reference: `docs/design/campaign-studio-mobile.png`
- Palette: true white, deep ink, electric cobalt, graphite rules, restrained green and amber status colors.
- Container model: fixed brief composer rail plus open editorial result canvas on desktop; one continuous reading column on mobile.
- Result order: concept, three copy variants, launch checklist, visual direction, channel readiness, export.
- Channel readiness uses direct-labeled horizontal bars with visible percentages and an accessible table fallback.
