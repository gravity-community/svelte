export type StepperStatus = "done" | "current" | "upcoming" | "error";

export type StepperStep = {
  label: string;
  description?: string;
  href?: string;
  /** Overrides the status that `current` implies. */
  status?: StepperStatus;
};
