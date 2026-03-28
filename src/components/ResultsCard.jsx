function StatTile({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  );
}

export default function ResultsCard({ poll, onRefresh, canRefresh }) {
  return (
    <section className="glass-panel rounded-3xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Results
          </p>
          <h3 className="mt-2 text-xl font-semibold text-white">
            On-chain totals
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={!canRefresh || poll.loading}
          className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {poll.loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatTile label="YES" value={poll.yes} accent="text-emerald-300" />
        <StatTile label="NO" value={poll.no} accent="text-rose-300" />
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {poll.lastUpdated
          ? `Last synced: ${new Date(poll.lastUpdated).toLocaleString()}`
          : "Connect a funded wallet or set a read-only public key in .env to load results."}
      </p>
    </section>
  );
}
