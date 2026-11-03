import type { StepperStatus, StepperStep } from "./types.ts";

/** The step's own status, or the one its place relative to `current` implies. */
export function statusOf(
  step: StepperStep,
  index: number,
  current: number,
): StepperStatus {
  if (step.status) return step.status;
  if (index < current) return "done";
  return index === current ? "current" : "upcoming";
}
