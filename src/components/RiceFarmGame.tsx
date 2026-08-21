"use client";

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
    sellAllRice,
    buyArea,
    buyFarmer,
    buyTool,
    buySoil,
    rebirth,
  } = useGameState();

  const sellPrice = getSellPrice(state.rebirths);

  return (
    <div className="flex flex-1 flex-col items-center bg-amber-50/40 px-4 py-8 dark:bg-zinc-950 sm:px-8">
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

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Your Farm
            </h2>
            <button
              onClick={sellAllRice}
              disabled={state.rice <= 0}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
            >
              Sell All Rice ({sellPrice.toFixed(2)}💰 each)
            </button>
          </div>
          <PlotGrid
            plots={state.plots}
            areas={state.areas}
            now={now}
            onPlant={plantPlot}
            onHarvest={harvestPlot}
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
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
