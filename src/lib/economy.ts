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
const RICE_VALUE_BONUS_PER_REBIRTH = 0.04;

export function getMaxPlots(rebirths: number): number {
  return BASE_MAX_PLOTS + rebirths * PLOTS_PER_REBIRTH;
}

export function getRebirthCost(rebirths: number): number {
  return REBIRTH_BASE_COST * Math.pow(REBIRTH_COST_MULT, rebirths);
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
