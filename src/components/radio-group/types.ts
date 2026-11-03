/** A radio of the group: its value, its label and, optionally, what it means. */
export type RadioGroupItem<V extends string = string> = {
  readonly value: V;
  readonly label: string;
  readonly description?: string;
  readonly disabled?: boolean;
};
