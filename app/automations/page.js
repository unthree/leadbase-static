export default function AutomationsPage() {
  return (
    <>
      <h1 className="page-title">⚙︎ Automations</h1>
      <p className="page-sub">Coming soon.</p>
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-title">Planned</div>
        <p className="muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
          • Scheduled newsletter runs (cron)
          <br />• Auto-sync sources from X and YouTube
          <br />• Agent-run sponsor outreach follow-ups
          <br />• Nightly backup to Google Drive / iCloud (see scripts/backup.sh — works today, run manually or via launchd)
        </p>
      </div>
    </>
  );
}
