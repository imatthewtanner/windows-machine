import type { ChannelReadiness } from "../types";

export function ReadinessChart({ data }: { data: ChannelReadiness[] }) {
  return (
    <div className="readiness" role="group" aria-labelledby="readiness-title">
      <div className="readiness-bars" aria-hidden="true">
        {data.map(item => (
          <div className="readiness-row" key={item.channel}>
            <strong>{item.channel}</strong>
            <span className="evidence">{item.evidence}</span>
            <span className="bar-track"><span className="bar-fill" style={{ width: `${item.score}%` }} /></span>
            <b>{item.score}%</b>
          </div>
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>Campaign channel readiness and supporting evidence</caption>
          <thead><tr><th>Channel</th><th>Readiness</th><th>Evidence</th></tr></thead>
          <tbody>{data.map(item => <tr key={item.channel}><td>{item.channel}</td><td>{item.score}%</td><td>{item.evidence}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
