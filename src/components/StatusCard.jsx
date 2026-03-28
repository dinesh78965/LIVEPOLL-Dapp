export default function StatusCard({ tx, wallet }) {
  return (
    <section className="glass-panel rounded-3xl p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
        Status
      </p>
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Wallet state
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {wallet.publicKey ? "Connected" : "Disconnected"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Transaction state
          </p>
          <p className="mt-2 text-sm text-slate-200">
            {tx.status === "idle" && "No transaction in flight."}
            {tx.status === "pending" && "Pending confirmation..."}
            {tx.status === "success" && "Transaction confirmed."}
            {tx.status === "error" && "Transaction failed."}
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-slate-900/70 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Hash / Error
          </p>
          <code className="mt-2 block break-all text-xs text-cyan-200">
            {tx.hash || tx.error || "Waiting for your next action"}
          </code>
        </div>
      </div>
    </section>
  );
}
