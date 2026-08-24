export const STARTING_AREAS = 3;
export const BASE_MAX_PLOTS = 12;
export const PLOTS_PER_REBIRTH = 1;

export const BASE_GROW_MS = 8000;
export const MIN_GROW_MS = 1200;
export const BASE_YIELD = 1;
export const SELL_PRICE_PER_RICE = 3;

const AREA_BASE_COST = 30;
const AREA_COST_MULT = 1.26;

const TOOL_BASE_COST = 40;
const TOOL_COST_MULT = 1.35;

const SOIL_BASE_COST = 35;
const SOIL_COST_MULT = 1.3;

const FARMER_BASE_COST = 90;
const FARMER_COST_MULT = 1.55;

const REBIRTH_BASE_COST = 100_000;
const REBIRTH_COST_MULT = 6;
const REBIRTH_RICE_TO_COIN_RATIO = 5 / 10;
export const RICE_VALUE_BONUS_PER_REBIRTH = 0.25;

export function getMaxPlots(rebirths: number): number {
  return BASE_MAX_PLOTS + rebirths * PLOTS_PER_REBIRTH;
}

export function getRebirthCost(rebirths: number): number {
  return REBIRTH_BASE_COST * Math.pow(REBIRTH_COST_MULT, rebirths);
}

export function getRebirthRiceCost(rebirths: number): number {
  return Math.round(getRebirthCost(rebirths) * REBIRTH_RICE_TO_COIN_RATIO);
}

export function getSellPrice(rebirths: number): number {
  return SELL_PRICE_PER_RICE * Math.pow(1 + RICE_VALUE_BONUS_PER_REBIRTH, rebirths);
}

export function getAreaCost(areas: number): number {
  return Math.round(AREA_BASE_COST * Math.pow(AREA_COST_MULT, areas - STARTING_AREAS));
}

export function getToolCost(toolLevel: number): number {
  return Math.round(TOOL_BASE_COST * Math.pow(TOOL_COST_MULT, toolLevel));
}

export function getSoilCost(soilLevel: number): number {
  return Math.round(SOIL_BASE_COST * Math.pow(SOIL_COST_MULT, soilLevel));
}

export function getFarmerCost(farmers: number): number {
  return Math.round(FARMER_BASE_COST * Math.pow(FARMER_COST_MULT, farmers));
}

export function getGrowDurationMs(toolLevel: number): number {
  return Math.max(MIN_GROW_MS, Math.round(BASE_GROW_MS * Math.pow(0.88, toolLevel)));
}

export function getYieldPerHarvest(soilLevel: number): number {
  return BASE_YIELD + soilLevel;
}

// The lowest tool level at which growth time has already hit MIN_GROW_MS — buying
// tools past this point would cost coins for zero effect, so purchases cap here.
function computeMaxToolLevel(): number {
  let level = 0;
  while (getGrowDurationMs(level) > MIN_GROW_MS) {
    level++;
  }
  return level;
}

export const MAX_TOOL_LEVEL = computeMaxToolLevel();

// Rain: a server-wide weather event, not per-player. Every client independently
// computes the exact same schedule from a fixed epoch using a seeded PRNG, so
// everyone sees rain at the same wall-clock time with no backend/cron needed.
const RAIN_EPOCH_MS = Date.UTC(2025, 0, 1);
const RAIN_MIN_GAP_MS = 60 * 60 * 1000;
const RAIN_MAX_GAP_MS = 2 * 60 * 60 * 1000;
export const RAIN_DURATION_MS = 30 * 60 * 1000;
export const RAIN_GROWTH_MULTIPLIER = 2;

function rainSeedRandom(index: number): number {
  let seed = (index + 1) * 0x9e3779b1;
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b);
  seed = seed ^ (seed >>> 16);
  return (seed >>> 0) / 4294967296;
}

export interface RainStatus {
  isRaining: boolean;
  // If raining: when the current rain ends. If not: when the next rain starts.
  currentIntervalEnd: number;
}

export function getRainStatus(now: number): RainStatus {
  let cursor = RAIN_EPOCH_MS;
  let index = 0;
  for (let i = 0; i < 500_000; i++) {
    const gap = RAIN_MIN_GAP_MS + rainSeedRandom(index) * (RAIN_MAX_GAP_MS - RAIN_MIN_GAP_MS);
    const start = cursor + gap;
    const end = start + RAIN_DURATION_MS;
    if (now < start) {
      return { isRaining: false, currentIntervalEnd: start };
    }
    if (now < end) {
      return { isRaining: true, currentIntervalEnd: end };
    }
    cursor = end;
    index++;
  }
  return { isRaining: false, currentIntervalEnd: now + RAIN_MIN_GAP_MS };
}

export function getGrowthRateMultiplier(now: number): number {
  return getRainStatus(now).isRaining ? RAIN_GROWTH_MULTIPLIER : 1;
}
