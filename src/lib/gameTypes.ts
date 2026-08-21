export type PlotStatus = "empty" | "growing" | "ready";

export interface Plot {
  id: number;
  status: PlotStatus;
  plantedAt?: number;
  growDurationMs?: number;
}

export interface GameState {
  coins: number;
  rice: number;
  areas: number;
  farmers: number;
  toolLevel: number;
  soilLevel: number;
  rebirths: number;
  plots: Plot[];
}
