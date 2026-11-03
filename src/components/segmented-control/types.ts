export type SegmentedControlItem = {
  label: string;
  /** Matched against the control's `value`. Defaults to `label`. */
  value?: string;
  /** Renders the segment as a link; takes effect when every segment has one. */
  href?: string;
};

export type SegmentedControlSize = "md" | "sm";
