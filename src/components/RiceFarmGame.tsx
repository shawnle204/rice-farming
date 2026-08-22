"use client";

import { useState } from "react";
import { PlotGrid } from "@/components/PlotGrid";
import { Shop } from "@/components/Shop";
import { StatsBar } from "@/components/StatsBar";
import { useGameState } from "@/hooks/useGameState";
import { getSellPrice } from "@/lib/economy";

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
      <main className="flex w-full max-w-3xl flex-col gap-6">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-amber-950 dark:text-amber-100">
            🌾 Rice Farm
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Plant, grow, and harvest rice. Sell it for coins and grow your farm.
          </p>
        </header>

        <StatsBar state={state} />

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
      </main>
    </div>
  );
}
