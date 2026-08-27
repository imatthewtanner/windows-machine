import { useMemo, useRef, useState, type FormEvent } from "react";
import { ApiError, generateCampaign } from "./api";
import { BriefForm } from "./components/BriefForm";
import { CampaignResult } from "./components/CampaignResult";
import { SparkIcon, WarningIcon } from "./components/Icons";
import { demoPackage, initialBrief } from "./demoData";
import type { CampaignBrief, CampaignPackage, FieldIssue } from "./types";

function validate(brief: CampaignBrief): FieldIssue[] {
  const issues: FieldIssue[] = [];
  if (brief.brief.trim().length < 10) issues.push({ field: "brief", code: "too_short", message: "Enter at least 10 characters." });
  if (brief.targetAudience.trim().length < 3) issues.push({ field: "targetAudience", code: "too_short", message: "Describe the intended audience." });
  if (brief.productDetails.trim().length < 10) issues.push({ field: "productDetails", code: "too_short", message: "Add product facts and differentiators." });
  if (brief.tone.trim().length < 2) issues.push({ field: "tone", code: "too_short", message: "Describe the campaign tone." });
  if (brief.channels.length === 0) issues.push({ field: "channels", code: "required", message: "Select at least one desired channel." });
  return issues;
}

export default function App() {
  const demoMode = useMemo(() => new URLSearchParams(window.location.search).get("demo") === "1", []);
  const [brief, setBrief] = useState(initialBrief);
  const [campaign, setCampaign] = useState<CampaignPackage | null>(demoMode ? demoPackage : null);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const nextIssues = validate(brief);
    setIssues(nextIssues);
    setError(null);
    if (nextIssues.length) return;

    if (demoMode) {
      setIsLoading(true);
      window.setTimeout(() => { setCampaign({ ...demoPackage, brief }); setIsLoading(false); }, 700);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    try {
      setCampaign(await generateCampaign(brief, abortRef.current.signal));
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === "AbortError") return;
      if (caught instanceof ApiError && caught.problem.validation?.issues) setIssues(caught.problem.validation.issues);
      setError(caught instanceof Error ? caught.message : "Campaign generation failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-lockup"><strong>Campaign Studio</strong><span>Turn a brief into a launchable direction.</span></div>
        <div className="service-status"><span />Ready</div>
      </header>
      <main className="workspace">
        <aside className="composer" aria-label="Campaign brief composer">
          <BriefForm value={brief} issues={issues} isLoading={isLoading} onChange={setBrief} onSubmit={submit} />
        </aside>
        <div className="result-canvas">
          {error && <div className="error-banner" role="alert"><WarningIcon /><div><strong>Campaign generation stopped</strong><p>{error}</p></div><button onClick={() => setError(null)}>Dismiss</button></div>}
          {isLoading && <LoadingState />}
          {!campaign && !isLoading && <EmptyState />}
          {campaign && !isLoading && <CampaignResult campaign={campaign} />}
        </div>
      </main>
    </div>
  );
}

function EmptyState() {
  return <section className="empty-state"><SparkIcon /><h1>Build a campaign direction</h1><p>Complete the brief to generate a focused concept, three copy variants, a launch checklist, visual prompts, campaign images, and channel readiness.</p><ol><li>Shape the brief</li><li>Generate the package</li><li>Review and export</li></ol></section>;
}

function LoadingState() {
  return <section className="loading-state" aria-live="polite"><div className="loading-mark"><SparkIcon /></div><h1>Building your campaign</h1><p>Shaping the concept, channel copy, launch plan, and visual direction.</p><div className="progress-line"><span /></div><div className="loading-steps"><span className="active">Strategy</span><span>Copy</span><span>Visuals</span><span>Readiness</span></div></section>;
}

