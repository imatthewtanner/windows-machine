export type CampaignBrief = {
  brief: string;
  targetAudience: string;
  productDetails: string;
  tone: string;
  channels: string[];
};

export type FieldIssue = { field: keyof CampaignBrief | "channels"; code: string; message: string };
export type CampaignConcept = { name: string; centralIdea: string; rationale: string };
export type CopyVariant = { number: number; headline: string; body: string; channels: string[] };
export type ChecklistItem = { order: number; text: string; ownerHint: string };
export type ImageDirection = { prompt: string; altText: string };
export type GeneratedImage = { id: string; prompt: string; url: string | null; size: string; status: "generated" | "failed"; error: string | null };
export type ChannelReadiness = { channel: string; score: number; evidence: string };
export type CampaignPackage = {
  id: string;
  status: "complete" | "partial";
  brief: CampaignBrief;
  concept: CampaignConcept;
  copyVariants: CopyVariant[];
  launchChecklist: ChecklistItem[];
  imageDirections: ImageDirection[];
  images: GeneratedImage[];
  channelReadiness: ChannelReadiness[];
  metadata: { model: string; reasoningEffort: string; schemaVersion: string; createdAt: string; correlationId: string };
};

export type ProblemDetails = { title?: string; detail?: string; correlationId?: string; validation?: { issues: FieldIssue[] } };

