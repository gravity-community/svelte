import { tv } from "../../utils/classes.ts";

export const energyRange = ["2", "1"] as const;

/** The box around a one-line field, shared by Input and PhoneInput. */
export const inputShell = tv({
  slots: {
    // A border at both levels, transparent at 2, keeps the same inset, and forced colours draw it.
    base: "flex w-full items-center overflow-clip border font-sans font-normal",
    control:
      "min-w-0 flex-1 bg-transparent text-inherit placeholder:text-muted-fg focus-visible:outline-hidden disabled:cursor-not-allowed",
    icon: "flex shrink-0 items-center justify-center",
  },
  variants: {
    energy: {
      // Controls inside (reveal, steppers, country picker) draw the global focus ring over the focused fill.
      "2": {
        base:
          "border-transparent *:[--color-border-focus:var(--color-well-focus-ring)]",
      },
      "1": {},
    },
    state: {
      default: {},
      invalid: {},
      disabled: {
        base:
          "cursor-not-allowed border-transparent bg-surface-muted text-disabled-fg opacity-60",
      },
    },
    size: {
      sm: {
        base: "h-9 gap-1 rounded-[10px] px-2.5 py-2 text-sm",
        icon: "size-3.5",
      },
      md: {
        base: "h-12 gap-1.5 rounded-xl px-3.5 py-3 text-base",
        icon: "size-4",
      },
      lg: {
        base: "h-14 gap-2 rounded-[14px] px-4.5 py-4 text-lg",
        icon: "size-[18px]",
      },
    },
    // After size, so tailwind-merge drops the size's corner radius.
    shape: { rounded: {}, pill: { base: "rounded-full" } },
  },
  // Tailwind emits hover after focus-within, so hover skips a focused field.
  // deno-fmt-ignore
  compoundVariants: [
    { energy: "2", state: "default", class: "bg-well text-fg focus-within:bg-well-active" },
    { energy: "2", state: "invalid", class: "bg-danger-subtle text-danger-strong focus-within:bg-danger-muted" },
    { energy: "1", state: "default", class: "border-border-field bg-transparent text-fg hover:not-focus-within:border-border-field-hover focus-within:border-border-focus focus-within:inset-ring focus-within:inset-ring-border-focus" },
    { energy: "1", state: "invalid", class: "border-danger-solid bg-transparent text-danger-strong focus-within:inset-ring focus-within:inset-ring-danger-solid" },
  ],
  defaultVariants: {
    state: "default",
    size: "md",
    shape: "rounded",
  },
});
