import type { FormEvent } from "react";
import type { CampaignBrief, FieldIssue } from "../types";
import { SparkIcon } from "./Icons";

const channelOptions = [
  ["Email", "Newsletter + promotional emails"],
  ["Social", "Instagram, Facebook, TikTok"],
  ["Display", "Web banners and digital ads"],
  ["Landing page", "Dedicated product landing page"]
] as const;

type Props = {
  value: CampaignBrief;
  issues: FieldIssue[];
  isLoading: boolean;
  onChange: (next: CampaignBrief) => void;
  onSubmit: (event: FormEvent) => void;
};

export function BriefForm({ value, issues, isLoading, onChange, onSubmit }: Props) {
  const issueFor = (field: string) => issues.find(issue => issue.field === field)?.message;
  const set = <K extends keyof CampaignBrief>(key: K, next: CampaignBrief[K]) => onChange({ ...value, [key]: next });
  const toggleChannel = (channel: string) => set("channels", value.channels.includes(channel) ? value.channels.filter(item => item !== channel) : [...value.channels, channel]);

  return (
    <form className="brief-form" onSubmit={onSubmit} noValidate>
      <fieldset disabled={isLoading}>
        <legend className="sr-only">Campaign brief</legend>
        <FormField label="Campaign brief" hint={`${value.brief.length} / 1000`} error={issueFor("brief")}>
          <textarea aria-label="Campaign brief" value={value.brief} maxLength={1000} rows={5} onChange={event => set("brief", event.target.value)} aria-invalid={Boolean(issueFor("brief"))} />
        </FormField>
        <FormField label="Target audience" error={issueFor("targetAudience")}>
          <input aria-label="Target audience" value={value.targetAudience} maxLength={600} onChange={event => set("targetAudience", event.target.value)} aria-invalid={Boolean(issueFor("targetAudience"))} />
        </FormField>
        <FormField label="Product details" hint={`${value.productDetails.length} / 1200`} error={issueFor("productDetails")}>
          <textarea aria-label="Product details" value={value.productDetails} maxLength={1200} rows={4} onChange={event => set("productDetails", event.target.value)} aria-invalid={Boolean(issueFor("productDetails"))} />
        </FormField>
        <FormField label="Tone" error={issueFor("tone")}>
          <input aria-label="Tone" value={value.tone} maxLength={120} onChange={event => set("tone", event.target.value)} aria-invalid={Boolean(issueFor("tone"))} />
        </FormField>
        <div className="field channels-field">
          <span className="field-label">Desired channels</span>
          <div className="channel-list">
            {channelOptions.map(([channel, description]) => (
              <label className="channel-option" key={channel}>
                <input type="checkbox" checked={value.channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                <span className="custom-check" aria-hidden="true" />
                <span><strong>{channel}</strong><small>{description}</small></span>
              </label>
            ))}
          </div>
          {issueFor("channels") && <span className="field-error">{issueFor("channels")}</span>}
        </div>
      </fieldset>
      <button className="generate-button" type="submit" disabled={isLoading}>
        <SparkIcon />
        {isLoading ? "Generating campaign…" : "Generate campaign"}
      </button>
      <p className="form-status" aria-live="polite">{isLoading ? "Creating strategy, copy, checklist, and visuals." : "Your brief stays within this application."}</p>
    </form>
  );
}

function FormField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      <span className={error ? "field-meta field-error" : "field-meta"}>{error || hint}</span>
    </label>
  );
}
