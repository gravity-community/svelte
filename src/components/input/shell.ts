import { tv } from "../../utils/classes.ts";

/** The bordered box around a one-line field, shared by Input and PhoneInput. */
export const inputShell = tv({
  slots: {
    // Forced colours drop fills, so tinted fields need the edge there.
    base:
      "flex w-full items-center overflow-clip font-sans font-normal forced-colors:border",
    control:
      "min-w-0 flex-1 bg-transparent text-inherit focus-visible:outline-hidden placeholder:text-placeholder-fg disabled:cursor-not-allowed",
    icon: "flex shrink-0 items-center justify-center",
  },
  variants: {
    variant: {
      default: {},
      // Buttons inside (clear, reveal) draw the global focus outline over the focused fill.
      tinted: {
        base: "[--color-border-focus:var(--color-field-tinted-focus-ring)]",
        control: "placeholder:text-muted-fg",
      },
      outline: {},
    },
    state: {
      default: {},
      invalid: {},
      disabled: {},
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
  },
  // deno-fmt-ignore
  compoundVariants: [
    { variant: "default", state: "default", class: "border border-border-interactive bg-surface text-fg focus-within:border-border-focus focus-within:inset-ring focus-within:inset-ring-border-focus" },
    { variant: "tinted", state: "default", class: "bg-field-tinted text-fg focus-within:bg-field-tinted-focus" },
    { variant: "outline", state: "default", class: "border border-border-interactive bg-surface text-fg focus-within:border-border-focus focus-within:inset-ring focus-within:inset-ring-border-focus" },
    { variant: ["default", "outline"], state: "invalid", class: "border border-danger-solid bg-surface text-danger-strong focus-within:inset-ring focus-within:inset-ring-danger-solid" },
    { variant: "tinted", state: "invalid", class: "bg-danger-subtle text-danger-strong focus-within:bg-danger-muted" },
    { variant: ["default", "outline"], state: "disabled", class: "cursor-not-allowed border border-border-subtle bg-surface text-disabled-fg opacity-60" },
    { variant: "tinted", state: "disabled", class: "cursor-not-allowed bg-surface-muted text-disabled-fg opacity-60" },
    { variant: "outline", class: "rounded-full" },
  ],
  defaultVariants: { variant: "default", state: "default", size: "md" },
});
