import { useMemo, useState } from "react";
import type { CampaignPackage } from "../types";
import { CheckIcon, DownloadIcon, WarningIcon } from "./Icons";
import { ReadinessChart } from "./ReadinessChart";

export function CampaignResult({ campaign }: { campaign: CampaignPackage }) {
  const [checked, setChecked] = useState<number[]>([]);
  const created = useMemo(() => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(campaign.metadata.createdAt)), [campaign.metadata.createdAt]);
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(campaign, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `campaign-${campaign.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <article className="campaign-result" aria-live="polite">
      <section className="result-section concept-section">
        <div className="section-heading">
          <span className="section-check"><CheckIcon /></span>
          <div><h2>Campaign concept</h2><p className="concept-name">{campaign.concept.name}</p></div>
          <button className="export-button desktop-export" onClick={exportJson}><DownloadIcon />Export JSON</button>
        </div>
        <p className="central-idea">{campaign.concept.centralIdea}</p>
        <p className="rationale">{campaign.concept.rationale}</p>
      </section>

      <section className="result-section">
        <h2>Copy variants</h2>
        <ol className="copy-list">
          {campaign.copyVariants.map(variant => <li key={variant.number}><div><h3>{variant.headline}</h3><p>{variant.body}</p><small>{variant.channels.join(" · ")}</small></div></li>)}
        </ol>
      </section>

      <div className="split-sections">
        <section className="result-section checklist-section">
          <h2>Launch checklist</h2>
          <ul className="checklist">
            {campaign.launchChecklist.map(item => {
              const isChecked = checked.includes(item.order);
              return <li key={item.order}><label><input type="checkbox" checked={isChecked} onChange={() => setChecked(current => isChecked ? current.filter(order => order !== item.order) : [...current, item.order])} /><span className="task-check"><CheckIcon /></span><span><strong>{item.text}</strong><small>{item.ownerHint}</small></span></label></li>;
            })}
          </ul>
        </section>

        <section className="result-section visual-section">
          <h2>Visual direction</h2>
          <div className="image-grid">
            {campaign.imageDirections.map((direction, index) => {
              const image = campaign.images[index];
              return <figure key={direction.prompt}>
                {image?.url ? <img src={image.url} alt={direction.altText} /> : <div className="image-unavailable"><WarningIcon /><span>Image unavailable</span></div>}
                <figcaption><strong>Prompt:</strong> {direction.prompt}</figcaption>
                {image?.status === "failed" ? <p className="image-status warning"><WarningIcon />{image.error}</p> : <p className="image-status success"><CheckIcon />Image generated</p>}
              </figure>;
            })}
          </div>
        </section>
      </div>

      <section className="result-section readiness-section">
        <h2 id="readiness-title">Channel readiness</h2>
        <ReadinessChart data={campaign.channelReadiness} />
      </section>

      <footer className="result-footer">
        <span><CheckIcon />Campaign {campaign.status === "partial" ? "generated with a visual warning" : "generated successfully"}</span>
        <time dateTime={campaign.metadata.createdAt}>{created}</time>
        <button className="export-button mobile-export" onClick={exportJson}><DownloadIcon />Export JSON</button>
      </footer>
    </article>
  );
}

