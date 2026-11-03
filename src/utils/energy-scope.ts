import { getContext, setContext } from "svelte";
import type { IconCircleIntent } from "../components/icon-circle/types.ts";
import type { Level } from "./energy.ts";

/** What a composed component gives the parts in a slot: the level they match, and the intent of the soft fill under them, if any. */
export type EnergyScope = { level: Level; fill?: IconCircleIntent };

const KEY = Symbol("energy-scope");

/** Gives every Button, IconCircle and Badge rendered below (snippets included) this scope; `undefined` resets it, as overlays do. */
export function setEnergyScope(scope: () => EnergyScope | undefined): void {
  setContext(KEY, scope);
}

/** The scope of the nearest composed component above, as a getter that stays reactive; outside any scope it returns `undefined`. */
export function getEnergyScope(): () => EnergyScope | undefined {
  return getContext<(() => EnergyScope | undefined) | undefined>(KEY) ??
    (() => undefined);
}
