import type { CampaignBrief, CampaignPackage, ProblemDetails } from "./types";

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetails, public readonly status: number) {
    super(problem.detail || problem.title || "Campaign generation failed.");
  }
}

export async function generateCampaign(brief: CampaignBrief, signal?: AbortSignal): Promise<CampaignPackage> {
  const response = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(brief),
    signal
  });
  if (!response.ok) {
    const problem = (await response.json().catch(() => ({ title: "Campaign generation failed", detail: "The server returned an unreadable error." }))) as ProblemDetails;
    throw new ApiError(problem, response.status);
  }
  return response.json() as Promise<CampaignPackage>;
}

