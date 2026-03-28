export default function ErrorBanner({ message, onDismiss }) {
  return (
    <div className="glass-panel flex items-start justify-between gap-4 rounded-2xl border border-rose-400/25 px-4 py-3">
      <p className="text-sm text-rose-100">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300 transition hover:bg-white/5"
      >
        Clear
      </button>
    </div>
  );
}
