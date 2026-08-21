import type { Plot } from "@/lib/gameTypes";

interface PlotGridProps {
  plots: Plot[];
  areas: number;
  now: number;
  onPlant: (id: number) => void;
  onHarvest: (id: number) => void;
}

function PlotTile({
  plot,
  unlocked,
  now,
  onPlant,
  onHarvest,
}: {
  plot: Plot;
  unlocked: boolean;
  now: number;
  onPlant: (id: number) => void;
  onHarvest: (id: number) => void;
}) {
  if (!unlocked) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-xl">🔒</span>
      </div>
    );
  }

  if (plot.status === "empty") {
    return (
      <button
        onClick={() => onPlant(plot.id)}
        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/50 text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-950/40"
      >
        <span className="text-2xl">➕</span>
        <span className="text-xs font-medium">Plant</span>
      </button>
    );
  }

  if (plot.status === "growing") {
    const progress =
      plot.plantedAt !== undefined && plot.growDurationMs
        ? Math.min(1, (now - plot.plantedAt) / plot.growDurationMs)
        : 0;
    return (
      <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-green-300 bg-green-50 p-2 dark:border-green-800 dark:bg-green-950/30">
        <span className="text-2xl">🌱</span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-200 dark:bg-green-900">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => onHarvest(plot.id)}
      className="flex aspect-square animate-pulse flex-col items-center justify-center gap-1 rounded-xl border-2 border-yellow-400 bg-yellow-50 text-yellow-800 transition-colors hover:bg-yellow-100 dark:border-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-300"
    >
      <span className="text-2xl">🌾</span>
      <span className="text-xs font-medium">Harvest</span>
    </button>
  );
}

export function PlotGrid({ plots, areas, now, onPlant, onHarvest }: PlotGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {plots.map((plot) => (
        <PlotTile
          key={plot.id}
          plot={plot}
          unlocked={plot.id < areas}
          now={now}
          onPlant={onPlant}
          onHarvest={onHarvest}
        />
      ))}
    </div>
  );
}
