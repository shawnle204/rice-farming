"use client";

import { useState } from "react";
import { PlotGrid } from "@/components/PlotGrid";
import { Shop } from "@/components/Shop";
import { StatsBar } from "@/components/StatsBar";
import { useGameState } from "@/hooks/useGameState";
import { getRainStatus, getSellPrice } from "@/lib/economy";

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function RiceFarmGame() {
  const {
    state,
    now,
    plantPlot,
    harvestPlot,
    sellRice,
    sellAllRice,
    buyArea,
    buyFarmer,
    buyTool,
    buySoil,
    rebirth,
  } = useGameState();

  const sellPrice = getSellPrice(state.rebirths);
  const rainStatus = getRainStatus(now);

  const [forceStacked, setForceStacked] = useState(false);

  const [sellAmount, setSellAmount] = useState("");
  const parsedSellAmount = Number(sellAmount);
  const canSellCustom =
    sellAmount.trim() !== "" &&
    Number.isInteger(parsedSellAmount) &&
    parsedSellAmount > 0 &&
    parsedSellAmount <= state.rice;

  const handleSellCustom = () => {
    if (!canSellCustom) return;
    sellRice(parsedSellAmount);
    setSellAmount("");
  };

  return (
    <div className="flex flex-1 flex-col items-center bg-amber-50/40 px-4 py-8 dark:bg-zinc-950/85 sm:px-8">
      <main
        className={`flex w-full max-w-3xl flex-col gap-6 ${forceStacked ? "" : "lg:max-w-5xl"}`}
      >
        <header className="text-center">
          <h1 className="text-3xl font-bold text-amber-950 dark:text-amber-100">
            🌾 Rice Farm
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Plant, grow, and harvest rice. Sell it for coins and grow your farm.
          </p>
        </header>

        <div
          className={`rounded-xl border px-4 py-2 text-center text-sm font-medium ${
            rainStatus.isRaining
              ? "border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
              : "border-zinc-200 bg-zinc-50/80 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400"
          }`}
        >
          {rainStatus.isRaining
            ? `🌧️ It's raining! Growth is 2x faster — ends in ${formatDuration(rainStatus.currentIntervalEnd - now)}`
            : `☀️ Clear skies — next rain in ${formatDuration(rainStatus.currentIntervalEnd - now)}`}
        </div>

        <StatsBar state={state} />

        <button
          onClick={() => setForceStacked((v) => !v)}
          className="hidden self-end text-xs font-medium text-zinc-500 underline-offset-2 hover:text-amber-700 hover:underline dark:text-zinc-400 dark:hover:text-amber-400 lg:block"
        >
          {forceStacked ? "⬌ Switch to side by side" : "⬍ Switch to stacked"}
        </button>

        <div
          className={`grid grid-cols-1 gap-6 ${forceStacked ? "" : "lg:grid-cols-2 lg:items-start"}`}
        >
          <section className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Your Farm
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={state.rice}
                    step={1}
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    placeholder="Amount"
                    aria-label="Amount of rice to sell"
                    className="w-20 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  />
                  <button
                    onClick={handleSellCustom}
                    disabled={!canSellCustom}
                    className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                  >
                    Sell
                  </button>
                </div>
                <button
                  onClick={sellAllRice}
                  disabled={state.rice <= 0}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
                >
                  Sell All ({sellPrice.toFixed(2)}💰 each)
                </button>
              </div>
            </div>
            <PlotGrid
              plots={state.plots}
              areas={state.areas}
              now={now}
              onPlant={plantPlot}
              onHarvest={harvestPlot}
            />
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Shop
            </h2>
            <Shop
              state={state}
              onBuyArea={buyArea}
              onBuyFarmer={buyFarmer}
              onBuyTool={buyTool}
              onBuySoil={buySoil}
              onRebirth={rebirth}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
