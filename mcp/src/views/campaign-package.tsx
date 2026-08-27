import "../index.css";
import { useDownload, useViewState } from "skybridge/web";
import { useToolInfo } from "../helpers.js";

export default function CampaignPackageView() {
  const tool = useToolInfo<"generate_campaign_package">();
  const [{ checked }, setState] = useViewState({ checked: [] as number[] });
  const { download } = useDownload();

  if (!tool.isSuccess) {
    return <main className="pending"><strong>Building campaign package</strong><p>Strategy, copy, visuals, and readiness are being assembled.</p></main>;
  }

  const campaign = tool.output.campaign;
  const exportPackage = async () => {
    await download({ contents: [{ type: "resource", resource: { uri: `file:///campaign-${campaign.id}.json`, mimeType: "application/json", text: JSON.stringify(campaign, null, 2) } }] });
  };

  return (
    <main className="mcp-card" data-llm={`Campaign ${campaign.id}: ${campaign.concept.name}. Status ${campaign.status}.`}>
      <header className="mcp-header">
        <div><h1>Campaign Studio</h1><p>{campaign.brief.targetAudience} · {campaign.brief.channels.join(" · ")}</p></div>
        <button className="export" onClick={exportPackage}>Export JSON</button>
      </header>
      <section className="summary"><strong>Campaign concept</strong><h2>{campaign.concept.name}</h2><p>{campaign.concept.centralIdea} {campaign.concept.rationale}</p></section>
      <div className="mcp-grid">
        <section className="mcp-section"><h3>Copy variants</h3><ol className="copy">{campaign.copyVariants.map(item => <li key={item.number}><strong>{item.headline}</strong><span>{item.body}</span></li>)}</ol></section>
        <section className="mcp-section"><h3>Launch checklist</h3><ul className="tasks">{campaign.launchChecklist.map(item => { const done = checked.includes(item.order); return <li key={item.order}><label><input type="checkbox" checked={done} onChange={() => setState(current => ({ checked: done ? current.checked.filter(order => order !== item.order) : [...current.checked, item.order] }))} /><span><strong>{item.text}</strong>{item.ownerHint}</span></label></li>; })}</ul></section>
      </div>
      <section className="mcp-section"><h3>Visual direction</h3><div className="images">{campaign.imageDirections.map((direction, index) => { const image = campaign.images[index]; return <figure key={direction.prompt}>{image?.url ? <img src={image.url} alt={direction.altText} /> : <div className="missing">Image unavailable</div>}<figcaption>{direction.prompt}</figcaption></figure>; })}</div></section>
      <section className="mcp-section"><h3>Channel readiness</h3><div className="bars">{campaign.channelReadiness.map(item => <div className="bar-row" key={item.channel} title={item.evidence}><strong>{item.channel}</strong><span className="track"><span style={{ width: `${item.score}%` }} /></span><b>{item.score}%</b></div>)}</div></section>
    </main>
  );
}
