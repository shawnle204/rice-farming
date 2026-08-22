import {
  getAreaCost,
  getFarmerCost,
  getGrowDurationMs,
  getMaxPlots,
  getRebirthCost,
  getSoilCost,
  getToolCost,
  getYieldPerHarvest,
  MAX_TOOL_LEVEL,
  MIN_GROW_MS,
  RICE_VALUE_BONUS_PER_REBIRTH,
} from "@/lib/economy";
import type { GameState } from "@/lib/gameTypes";

interface ShopProps {
  state: GameState;
  onBuyArea: () => void;
  onBuyFarmer: () => void;
  onBuyTool: () => void;
  onBuySoil: () => void;
  onRebirth: () => void;
}

function ShopItem({
  icon,
  title,
  description,
  cost,
  affordable,
  disabled,
  onBuy,
}: {
  icon: string;
  title: string;
  description: string;
  cost: number;
  affordable: boolean;
  disabled?: boolean;
  onBuy: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <div className="font-medium text-zinc-900 dark:text-zinc-100">{title}</div>
          <div className="text-xs text-zinc-500 dark:text-zinc-400">{description}</div>
        </div>
      </div>
      <button
        onClick={onBuy}
        disabled={disabled || !affordable}
        className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
      >
        {disabled ? "Max" : `💰 ${cost}`}
      </button>
    </div>
  );
}

function RebirthPanel({ state, onRebirth }: { state: GameState; onRebirth: () => void }) {
  const nextMaxPlots = getMaxPlots(state.rebirths + 1);
  const cost = getRebirthCost(state.rebirths);
  const eligible = state.coins >= cost && state.rice >= cost;
  const costLabel = cost.toLocaleString();
  const riceValueBonusLabel = Math.round(RICE_VALUE_BONUS_PER_REBIRTH * 100);

  return (
    <div className="flex items-center justify-between rounded-xl border border-purple-300 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/30">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🔁</span>
        <div>
          <div className="font-medium text-purple-900 dark:text-purple-200">
            Rebirth{state.rebirths > 0 && ` (x${state.rebirths})`}
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-400">
            Costs {costLabel} coins and {costLabel} rice. Resets your farm but permanently adds +1 max
            plot ({nextMaxPlots} total) and +{riceValueBonusLabel}% rice value.
          </div>
        </div>
      </div>
      <button
        onClick={onRebirth}
        disabled={!eligible}
        className="shrink-0 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
      >
        Rebirth
      </button>
    </div>
  );
}

export function Shop({ state, onBuyArea, onBuyFarmer, onBuyTool, onBuySoil, onRebirth }: ShopProps) {
  const maxPlots = state.plots.length;
  const areaCost = getAreaCost(state.areas);
  const farmerCost = getFarmerCost(state.farmers);
  const toolCost = getToolCost(state.toolLevel);
  const soilCost = getSoilCost(state.soilLevel);
  const areasMaxed = state.areas >= maxPlots;
  const farmersMaxed = state.farmers >= state.areas;
  const toolsMaxed = state.toolLevel >= MAX_TOOL_LEVEL;

  const nextGrowSec = (getGrowDurationMs(state.toolLevel + 1) / 1000).toFixed(1);
  const minGrowSec = (MIN_GROW_MS / 1000).toFixed(1);
  const nextYield = getYieldPerHarvest(state.soilLevel + 1);

  return (
    <div className="flex flex-col gap-2">
      <ShopItem
        icon="🏞️"
        title="Buy Area"
        description={`Unlocks another plot (${state.areas}/${maxPlots})`}
        cost={areaCost}
        affordable={state.coins >= areaCost}
        disabled={areasMaxed}
        onBuy={onBuyArea}
      />
      <ShopItem
        icon="👨‍🌾"
        title="Hire Farmer"
        description={`Each farmer auto-farms one area permanently (${state.farmers}/${state.areas})`}
        cost={farmerCost}
        affordable={state.coins >= farmerCost}
        disabled={farmersMaxed}
        onBuy={onBuyFarmer}
      />
      <ShopItem
        icon="🛠️"
        title="Better Tools"
        description={
          toolsMaxed
            ? `Fastest possible growth reached (${minGrowSec}s per crop)`
            : `Faster growth — next: ${nextGrowSec}s per crop`
        }
        cost={toolCost}
        affordable={state.coins >= toolCost}
        disabled={toolsMaxed}
        onBuy={onBuyTool}
      />
      <ShopItem
        icon="🟫"
        title="Better Soil"
        description={`More rice per harvest — next: ${nextYield} rice`}
        cost={soilCost}
        affordable={state.coins >= soilCost}
        onBuy={onBuySoil}
      />
      <RebirthPanel state={state} onRebirth={onRebirth} />
    </div>
  );
}
