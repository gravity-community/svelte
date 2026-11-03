/** `waiting` follows a step that isn't done yet; `blocked` can't go ahead for another reason. */
export type StepListStatus = "done" | "current" | "waiting" | "blocked";

export type StepListStep = {
  title: string;
  /** A line under the title, such as the answer in short or what the step waits for. */
  meta?: string;
  status: StepListStatus;
  /** Matched against the list's `value`. Defaults to `title`. */
  value?: string;
};
