import type { GameState } from "@/lib/gameTypes";

export function StatsBar({ state }: { state: GameState }) {
  const stats = [
    { label: "Coins", value: state.coins, icon: "💰" },
    { label: "Rice", value: state.rice, icon: "🌾" },
    { label: "Areas", value: state.areas, icon: "🏞️" },
    { label: "Farmers", value: state.farmers, icon: "👨‍🌾" },
    { label: "Tool Lv.", value: state.toolLevel, icon: "🛠️" },
    { label: "Soil Lv.", value: state.soilLevel, icon: "🟫" },
    { label: "Rebirths", value: state.rebirths, icon: "🔁" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40"
        >
          <span className="text-2xl">{stat.icon}</span>
          <span className="mt-1 text-lg font-semibold text-amber-950 dark:text-amber-100">
            {stat.value}
          </span>
          <span className="text-xs text-amber-700 dark:text-amber-400">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
