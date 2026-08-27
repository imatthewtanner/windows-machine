import { McpServer } from "skybridge/server";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const apiBaseUrl = (process.env.CAMPAIGN_STUDIO_API_URL ?? "http://127.0.0.1:5208").replace(/\/$/, "");
const apiOrigin = new URL(apiBaseUrl).origin;
const bearerToken = process.env.CAMPAIGN_STUDIO_TOKEN;
const mcpBearerToken = process.env.MCP_BEARER_TOKEN;

const BriefShape = {
  brief: z.string().trim().min(10).max(1000).describe("Short campaign objective and offer."),
  targetAudience: z.string().trim().min(3).max(600).describe("Audience description and relevant context."),
  productDetails: z.string().trim().min(10).max(1200).describe("Product facts, differentiators, and constraints."),
  tone: z.string().trim().min(2).max(120).describe("Desired campaign voice and tone."),
  channels: z.array(z.enum(["Email", "Social", "Display", "Landing page", "Search", "Video", "Print", "Events"])).min(1).max(8),
};

const ValidationSchema = z.object({
  isValid: z.boolean(),
  completeness: z.number().int().min(0).max(100),
  issues: z.array(z.object({ field: z.string(), code: z.string(), message: z.string() })),
  normalizedChannels: z.array(z.string()),
});

const CampaignSchema = z.object({
  id: z.string(),
  status: z.enum(["complete", "partial"]),
  brief: z.object(BriefShape),
  concept: z.object({ name: z.string(), centralIdea: z.string(), rationale: z.string() }),
  copyVariants: z.array(z.object({ number: z.number(), headline: z.string(), body: z.string(), channels: z.array(z.string()) })),
  launchChecklist: z.array(z.object({ order: z.number(), text: z.string(), ownerHint: z.string() })),
  imageDirections: z.array(z.object({ prompt: z.string(), altText: z.string() })),
  images: z.array(z.object({ id: z.string(), prompt: z.string(), url: z.string().nullable(), size: z.string(), status: z.enum(["generated", "failed"]), error: z.string().nullable() })),
  channelReadiness: z.array(z.object({ channel: z.string(), score: z.number(), evidence: z.string() })),
  metadata: z.object({ model: z.string(), reasoningEffort: z.string(), schemaVersion: z.string(), createdAt: z.string(), correlationId: z.string() }),
});

type Campaign = z.infer<typeof CampaignSchema>;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  if (bearerToken) headers.set("Authorization", `Bearer ${bearerToken}`);
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  if (!response.ok) {
    const problem = await response.json().catch(() => null) as { title?: string; detail?: string } | null;
    throw new Error(problem?.detail ?? problem?.title ?? `Campaign Studio API returned ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

function absoluteImageUrls(campaign: Campaign): Campaign {
  return {
    ...campaign,
    images: campaign.images.map(image => ({ ...image, url: image.url ? new URL(image.url, apiBaseUrl).toString() : null })),
  };
}

const server = new McpServer(
  { name: "campaign-studio", version: "1.0.0" },
  {
    capabilities: {},
    instructions: "Validate incomplete briefs before generation. Generate only after required product facts, audience, tone, and channels are present. Use get_campaign_package to retrieve a stable existing result. Never request or expose OpenAI credentials.",
  },
)
  .registerTool(
    {
      name: "validate_campaign_brief",
      title: "Validate campaign brief",
      description: "Use this when a developer wants to check campaign input completeness, field limits, supported channels, and actionable corrections without generating content.",
      inputSchema: BriefShape,
      outputSchema: { validation: ValidationSchema },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false, idempotentHint: true },
      securitySchemes: [{ type: "noauth" }],
    },
    async input => {
      const validation = await api<z.infer<typeof ValidationSchema>>("/api/campaigns/validate", { method: "POST", body: JSON.stringify(input) });
      return {
        structuredContent: { validation },
        content: validation.isValid
          ? `The campaign brief is complete (${validation.completeness}%).`
          : `The campaign brief is ${validation.completeness}% complete with ${validation.issues.length} issue(s) to correct.`,
      };
    },
  )
  .registerTool(
    {
      name: "generate_campaign_package",
      title: "Generate campaign package",
      description: "Use this when a developer has a complete brief and wants one structured campaign concept, exactly three copy variants, a launch checklist, image directions, generated-image status, and channel readiness. This creates a stored result and can consume OpenAI API usage.",
      inputSchema: BriefShape,
      outputSchema: { campaign: CampaignSchema },
      annotations: { readOnlyHint: false, openWorldHint: false, destructiveHint: false, idempotentHint: false },
      securitySchemes: [{ type: "noauth" }],
      view: {
        component: "campaign-package",
        description: "Inspect and export a generated campaign package.",
        prefersBorder: true,
        csp: { resourceDomains: [apiOrigin] },
        _meta: { "openai/widgetDescription": "A compact campaign package with concept, copy, launch checklist, generated visuals, and channel readiness." },
      },
      _meta: {
        "openai/widgetAccessible": true,
        "openai/toolInvocation/invoking": "Building campaign package…",
        "openai/toolInvocation/invoked": "Campaign package ready",
      },
    },
    async input => {
      const campaign = absoluteImageUrls(await api<Campaign>("/api/campaigns", { method: "POST", body: JSON.stringify(input) }));
      return {
        structuredContent: { campaign },
        content: `Generated campaign package ${campaign.id} with ${campaign.copyVariants.length} copy variants and ${campaign.images.filter(image => image.status === "generated").length} completed image(s).`,
      };
    },
  )
  .registerTool(
    {
      name: "get_campaign_package",
      title: "Get campaign package",
      description: "Use this when a developer already has a Campaign Studio result identifier and wants the latest export-ready text, image status, readiness data, and non-secret generation metadata.",
      inputSchema: { id: z.string().regex(/^[a-fA-F0-9]{32}$/).describe("Stable 32-character campaign result identifier.") },
      outputSchema: { campaign: CampaignSchema },
      annotations: { readOnlyHint: true, openWorldHint: false, destructiveHint: false, idempotentHint: true },
      securitySchemes: [{ type: "noauth" }],
    },
    async ({ id }) => {
      const campaign = absoluteImageUrls(await api<Campaign>(`/api/campaigns/${id}`));
      return {
        structuredContent: { campaign },
        content: `Retrieved campaign package ${campaign.id}. Status: ${campaign.status}.`,
      };
    },
  );

server.express.get("/health", (_request: Request, response: Response) => response.json({ status: "ready" }));
if (mcpBearerToken) {
  server.use("/mcp", (request: Request, response: Response, next: NextFunction) => {
    const supplied = request.headers.authorization?.replace(/^Bearer\s+/i, "") ?? "";
    const expectedBytes = Buffer.from(mcpBearerToken);
    const suppliedBytes = Buffer.from(supplied);
    if (expectedBytes.length !== suppliedBytes.length || !timingSafeEqual(expectedBytes, suppliedBytes)) {
      response.status(401).json({ error: "unauthorized" });
      return;
    }
    next();
  });
}
export default await server.run();
export type AppType = typeof server;
