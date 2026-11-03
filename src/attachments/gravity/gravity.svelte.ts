import type { Attachment } from "svelte/attachments";
import { register, unregister } from "./engine.ts";
import {
  GRAVITY_DEFAULTS,
  type GravityOptions,
  type GravityParameter,
  type ResolvedGravityParams,
} from "./types.ts";

/**
 * Leans the element toward a nearby pointer with spring physics. Option changes
 * update the spring in place. Hosts must not CSS-transition `transform`: use
 * the `transition-interactive` utility.
 *
 * @example <button {@attach gravity()}>Save</button>
 */
export function gravity(
  parameter: () => GravityParameter = () => true,
): Attachment<HTMLElement> {
  return (node) => {
    $effect(() => register(node, resolve(parameter())));
    return () => unregister(node);
  };
}

/** Folds a host's inert state (e.g. `disabled || loading`) into its gravity parameter. */
export function gravityParam(
  parameter: GravityParameter,
  inert: boolean,
): GravityParameter {
  if (parameter === false) return false;
  const options = asOptions(parameter);
  return { ...options, disabled: inert || options.disabled === true };
}

function asOptions(parameter: GravityParameter): GravityOptions {
  if (parameter === false) return { disabled: true };
  if (parameter === true || parameter == null) return {};
  return parameter;
}

function resolve(parameter: GravityParameter): ResolvedGravityParams {
  const options = asOptions(parameter);
  return {
    maxTilt: options.maxTilt ?? GRAVITY_DEFAULTS.maxTilt,
    reach: options.reach ?? null,
    lift: options.lift ?? GRAVITY_DEFAULTS.lift,
    stiffness: options.spring?.stiffness ?? GRAVITY_DEFAULTS.stiffness,
    damping: options.spring?.damping ?? GRAVITY_DEFAULTS.damping,
    shape: options.shape,
    disabled: options.disabled ?? false,
    debug: options.debug ?? false,
  };
}
