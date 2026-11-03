/** One match in a Combobox's list, shown as a two-line ResultOption. */
export type ComboboxItem = {
  value: string;
  title: string;
  /** Second line, e.g. identifier · city · legal form. */
  meta?: string;
  disabled?: boolean;
};
