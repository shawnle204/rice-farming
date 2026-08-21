"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  STARTING_AREAS,
  getAreaCost,
  getFarmerCost,
  getGrowDurationMs,
  getMaxPlots,
  getRebirthCost,
  getSellPrice,
  getSoilCost,
  getToolCost,
  getYieldPerHarvest,
} from "@/lib/economy";
import type { GameState, Plot } from "@/lib/gameTypes";
import { createClient } from "@/lib/supabase/client";

const SAVE_KEY = "rice-farming-save-v1";

interface GameSaveRow {
  user_id: string;
  coins: number;
  rice: number;
  areas: number;
  farmers: number;
  tool_level: number;
  soil_level: number;
  rebirths: number;
  plots: Plot[];
}

// Repairs states where areas/farmers drifted past what the save can actually support
// (e.g. areas counted higher than plots.length, from a since-fixed cap bug) — areas can
// never exceed the real number of plots granted, and farmers can never exceed areas.
function normalizeState(state: GameState): GameState {
  const areas = Math.min(state.areas, state.plots.length);
  const farmers = Math.min(state.farmers, areas);
  if (areas === state.areas && farmers === state.farmers) return state;
  return { ...state, areas, farmers };
}

function stateToRow(userId: string, state: GameState): GameSaveRow {
  return {
    user_id: userId,
    coins: state.coins,
    rice: state.rice,
    areas: state.areas,
    farmers: state.farmers,
    tool_level: state.toolLevel,
    soil_level: state.soilLevel,
    rebirths: state.rebirths,
    plots: state.plots,
  };
}

function rowToState(row: GameSaveRow): GameState {
  return normalizeState({
    coins: row.coins,
    rice: row.rice,
    areas: row.areas,
    farmers: row.farmers,
    toolLevel: row.tool_level,
    soilLevel: row.soil_level,
    rebirths: row.rebirths,
    plots: row.plots,
  });
}

function createInitialState(rebirths = 0): GameState {
  const plots: Plot[] = Array.from({ length: getMaxPlots(rebirths) }, (_, i) => ({
    id: i,
    status: "empty",
  }));
  return {
    coins: 10,
    rice: 0,
    areas: STARTING_AREAS,
    farmers: 0,
    toolLevel: 0,
    soilLevel: 0,
    rebirths,
    plots,
  };
}

// Older local saves stored the unlocked-plot count under the key "farmers"
// (before "Farmers" became the auto-harvest upgrade and that count was renamed "areas"),
// and predate the "rebirths" field entirely.
//
// Note: a save's plots.length is NOT re-validated against getMaxPlots(rebirths) here.
// getMaxPlots() reflects the current formula, which can be retuned over time; a save's
// plots array size was fixed at whatever formula was live when it was created (initial
// state or last rebirth), so plots.length itself is the source of truth for that save's
// current plot cap, not a live recomputation.
function loadState(): GameState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const rebirths = typeof parsed.rebirths === "number" ? parsed.rebirths : 0;
    if (!Array.isArray(parsed.plots) || parsed.plots.length < STARTING_AREAS) {
      return createInitialState();
    }
    const hasNewShape = typeof parsed.areas === "number";
    const areas = hasNewShape
      ? (parsed.areas as number)
      : typeof parsed.farmers === "number"
        ? (parsed.farmers as number)
        : STARTING_AREAS;
    const farmers = hasNewShape && typeof parsed.farmers === "number" ? (parsed.farmers as number) : 0;

    return normalizeState({
      coins: typeof parsed.coins === "number" ? parsed.coins : 10,
      rice: typeof parsed.rice === "number" ? parsed.rice : 0,
      areas,
      farmers,
      toolLevel: typeof parsed.toolLevel === "number" ? parsed.toolLevel : 0,
      soilLevel: typeof parsed.soilLevel === "number" ? parsed.soilLevel : 0,
      rebirths,
      plots: parsed.plots as Plot[],
    });
  } catch {
    return createInitialState();
  }
}

export function useGameState() {
  const [state, setState] = useState<GameState>(() => loadState());
  const [now, setNow] = useState<number>(() => Date.now());
  const [userId, setUserId] = useState<string | null>(null);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const syncedUserRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function syncWithServer(uid: string) {
      const { data: existing } = await supabase
        .from("game_saves")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (existing) {
        setState(rowToState(existing as GameSaveRow));
      } else {
        await supabase.from("game_saves").upsert(stateToRow(uid, stateRef.current));
      }
      syncedUserRef.current = uid;
    }

    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) syncWithServer(uid);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      if (uid && syncedUserRef.current !== uid) {
        syncWithServer(uid);
      }
      if (!uid) {
        syncedUserRef.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    if (userId && syncedUserRef.current === userId) {
      createClient().from("game_saves").upsert(stateToRow(userId, state)).then();
    }
  }, [state, userId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);
      setState((prev) => {
        let changed = false;
        let plots = prev.plots.map((plot) => {
          if (
            plot.status === "growing" &&
            plot.plantedAt !== undefined &&
            plot.growDurationMs !== undefined &&
            currentNow - plot.plantedAt >= plot.growDurationMs
          ) {
            changed = true;
            return { ...plot, status: "ready" as const };
          }
          return plot;
        });

        let riceGained = 0;
        if (prev.farmers > 0) {
          let actionsLeft = prev.farmers;
          const growDuration = getGrowDurationMs(prev.toolLevel);
          const yieldPerHarvest = getYieldPerHarvest(prev.soilLevel);
          plots = plots.map((plot) => {
            if (actionsLeft <= 0 || plot.id >= prev.areas) return plot;
            if (plot.status === "ready") {
              actionsLeft--;
              changed = true;
              riceGained += yieldPerHarvest;
              return { ...plot, status: "empty" as const, plantedAt: undefined, growDurationMs: undefined };
            }
            if (plot.status === "empty") {
              actionsLeft--;
              changed = true;
              return { ...plot, status: "growing" as const, plantedAt: currentNow, growDurationMs: growDuration };
            }
            return plot;
          });
        }

        if (!changed) return prev;
        return { ...prev, plots, rice: prev.rice + riceGained };
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const plantPlot = useCallback((plotId: number) => {
    setState((prev) => {
      const plot = prev.plots[plotId];
      if (!plot || plot.status !== "empty" || plotId >= prev.areas) return prev;
      const plots = prev.plots.map((p) =>
        p.id === plotId
          ? {
              ...p,
              status: "growing" as const,
              plantedAt: Date.now(),
              growDurationMs: getGrowDurationMs(prev.toolLevel),
            }
          : p
      );
      return { ...prev, plots };
    });
  }, []);

  const harvestPlot = useCallback((plotId: number) => {
    setState((prev) => {
      const plot = prev.plots[plotId];
      if (!plot || plot.status !== "ready") return prev;
      const plots = prev.plots.map((p) =>
        p.id === plotId ? { ...p, status: "empty" as const, plantedAt: undefined, growDurationMs: undefined } : p
      );
      return {
        ...prev,
        plots,
        rice: prev.rice + getYieldPerHarvest(prev.soilLevel),
      };
    });
  }, []);

  const sellRice = useCallback((amount: number) => {
    setState((prev) => {
      const qty = Math.min(amount, prev.rice);
      if (qty <= 0) return prev;
      return {
        ...prev,
        rice: prev.rice - qty,
        coins: prev.coins + Math.round(qty * getSellPrice(prev.rebirths)),
      };
    });
  }, []);

  const sellAllRice = useCallback(() => {
    setState((prev) => {
      if (prev.rice <= 0) return prev;
      return {
        ...prev,
        coins: prev.coins + Math.round(prev.rice * getSellPrice(prev.rebirths)),
        rice: 0,
      };
    });
  }, []);

  const buyArea = useCallback(() => {
    setState((prev) => {
      if (prev.areas >= prev.plots.length) return prev;
      const cost = getAreaCost(prev.areas);
      if (prev.coins < cost) return prev;
      return { ...prev, coins: prev.coins - cost, areas: prev.areas + 1 };
    });
  }, []);

  const buyFarmer = useCallback(() => {
    setState((prev) => {
      if (prev.farmers >= prev.areas) return prev;
      const cost = getFarmerCost(prev.farmers);
      if (prev.coins < cost) return prev;
      return { ...prev, coins: prev.coins - cost, farmers: prev.farmers + 1 };
    });
  }, []);

  const buyTool = useCallback(() => {
    setState((prev) => {
      const cost = getToolCost(prev.toolLevel);
      if (prev.coins < cost) return prev;
      return { ...prev, coins: prev.coins - cost, toolLevel: prev.toolLevel + 1 };
    });
  }, []);

  const buySoil = useCallback(() => {
    setState((prev) => {
      const cost = getSoilCost(prev.soilLevel);
      if (prev.coins < cost) return prev;
      return { ...prev, coins: prev.coins - cost, soilLevel: prev.soilLevel + 1 };
    });
  }, []);

  const rebirth = useCallback(() => {
    setState((prev) => {
      const cost = getRebirthCost(prev.rebirths);
      if (prev.coins < cost || prev.rice < cost) return prev;
      return createInitialState(prev.rebirths + 1);
    });
  }, []);

  return {
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
  };
}
