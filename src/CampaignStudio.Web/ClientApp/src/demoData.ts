import type { CampaignBrief, CampaignPackage } from "./types";

export const initialBrief: CampaignBrief = {
  brief: "Launch our new hydration drink, Flow Electrolytes. Clean ingredients, zero sugar, fast hydration for workouts and busy days. Summer launch.",
  targetAudience: "Active adults 18–35",
  productDetails: "Flow Electrolytes powder sticks with natural flavors, coconut water powder, essential electrolytes, and 16 sticks per box.",
  tone: "Energetic, clean, and motivating",
  channels: ["Email", "Social", "Display", "Landing page"]
};

export const demoPackage: CampaignPackage = {
  id: "42b91239d1ce4e0da8f4263f9c43ad40",
  status: "partial",
  brief: initialBrief,
  concept: {
    name: "Hydrate Forward",
    centralIdea: "Clean hydration that keeps pace with real life.",
    rationale: "Flow turns hydration into an everyday performance habit—fast, simple, and free from the extras active people do not need."
  },
  copyVariants: [
    { number: 1, headline: "Hydrate harder. Feel better.", body: "Clean electrolytes. Zero sugar. Fast hydration for every workout and every day.", channels: ["Email", "Social", "Display"] },
    { number: 2, headline: "Clean ingredients. Serious hydration.", body: "Flow delivers what your body needs—nothing it does not.", channels: ["Email", "Landing page"] },
    { number: 3, headline: "Your edge. Every day.", body: "Stay sharp, stay strong, stay hydrated with Flow.", channels: ["Social", "Display", "Landing page"] }
  ],
  launchChecklist: [
    { order: 1, text: "Finalize channel copy and offer", ownerHint: "Campaign lead" },
    { order: 2, text: "Approve visual direction and assets", ownerHint: "Creative lead" },
    { order: 3, text: "Build and review landing page", ownerHint: "Web team" },
    { order: 4, text: "QA across channels and devices", ownerHint: "QA owner" },
    { order: 5, text: "Set tracking and UTM parameters", ownerHint: "Analytics" },
    { order: 6, text: "Schedule launch and notify partners", ownerHint: "Campaign lead" }
  ],
  imageDirections: [
    { prompt: "Electrolyte stick pack cutting through a crisp citrus splash on cobalt blue", altText: "Flow electrolyte stick with citrus water splash" },
    { prompt: "Active woman hydrating after a coastal run in bright natural light", altText: "Runner drinking water near the coast" }
  ],
  images: [
    { id: "demo-flow-product", prompt: "Product splash, citrus, energy", url: "/demo/flow-product.png", size: "1536x1024", status: "generated", error: null },
    { id: "demo-flow-lifestyle", prompt: "Active lifestyle, hydrate anywhere", url: "/demo/flow-lifestyle.png", size: "1536x1024", status: "failed", error: "The second image needs a wider crop. Retry generation when ready." }
  ],
  channelReadiness: [
    { channel: "Email", score: 100, evidence: "2 copy variants; 6 launch checks; 1 visual." },
    { channel: "Social", score: 82, evidence: "2 copy variants; 6 launch checks; 1 visual." },
    { channel: "Display", score: 75, evidence: "2 copy variants; 6 launch checks; 1 visual." },
    { channel: "Landing page", score: 90, evidence: "2 copy variants; 6 launch checks; 1 visual." }
  ],
  metadata: { model: "gpt-5.6", reasoningEffort: "medium", schemaVersion: "campaign-package-v1", createdAt: "2026-08-27T12:00:00Z", correlationId: "demo-correlation" }
};

