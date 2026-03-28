import WalletPanel from "../components/WalletPanel";
import PollCard from "../components/PollCard";
import ResultsCard from "../components/ResultsCard";
import StatusCard from "../components/StatusCard";
import ErrorBanner from "../components/ErrorBanner";
import { useLivePoll } from "../hooks/useLivePoll";
import { READONLY_ACCOUNT_PUBLIC_KEY } from "../lib/constants";

export default function HomePage() {
  const {
    wallet,
    poll,
    tx,
    voteState,
    connectWallet,
    disconnectWallet,
    voteYes,
    voteNo,
    refreshResults,
    clearError,
  } = useLivePoll();

  return (
    <main className="grid-overlay min-h-screen overflow-hidden text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-cyan-200">
              Stellar Soroban dApp
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Live Poll
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              A dark, wallet-connected web3 poll built with React, Vite, Tailwind
              CSS, Soroban, and Freighter.
            </p>
          </div>

          <WalletPanel
            wallet={wallet}
            onConnect={connectWallet}
            onDisconnect={disconnectWallet}
          />
        </header>

        {wallet.error && (
          <div className="mb-6">
            <ErrorBanner message={wallet.error} onDismiss={clearError} />
          </div>
        )}

        <section className="grid flex-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <PollCard
            wallet={wallet}
            tx={tx}
            voteState={voteState}
            onVoteYes={voteYes}
            onVoteNo={voteNo}
          />

          <div className="flex flex-col gap-6">
            <ResultsCard
              poll={poll}
              onRefresh={refreshResults}
              canRefresh={Boolean(wallet.publicKey || READONLY_ACCOUNT_PUBLIC_KEY)}
            />
            <StatusCard tx={tx} wallet={wallet} />
          </div>
        </section>
      </div>
    </main>
  );
}
