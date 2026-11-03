export type InputVariant = "default" | "tinted" | "outline";

export type InputSize = "sm" | "md" | "lg";

/** Native types that render as a one-line text field; select, textarea and file have their own components. */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "search"
  | "tel"
  | "url"
  | "number"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week";
