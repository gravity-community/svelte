<script module lang="ts">
import { tv } from "../../utils/classes.ts";

// text-on-avatar, not text-on-inverse: the field is dark in both schemes.
const avatar = tv({
  base:
    "inline-flex shrink-0 items-center justify-center font-semibold text-on-avatar select-none",
  variants: {
    size: {
      xs: "size-5 text-[9px]",
      sm: "size-8 text-xs",
      md: "size-10 text-sm",
      lg: "size-12 text-base",
    },
    shape: { circle: "rounded-full", square: "rounded-lg" },
  },
  defaultVariants: { size: "md" },
});
</script>

<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { cn, type VariantProps } from "../../utils/classes.ts";
import { initialsOf } from "../../utils/initials.ts";
import { avatarField, type AvatarVariant, fieldStyle } from "./field.ts";

type Props = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof avatar> & {
  name: string;
  /** Opaque, stable account id: the field's only input. Never a name (not
   * unique) or an email (guessable). Empty when no account resolves. */
  userId: string;
  /** Required so one account never draws two ways; derive it from one app-wide mapping. */
  variant: AvatarVariant;
  /** Squares the avatar unless `shape` says otherwise. */
  organization?: string;
  /** Overrides the initials derived from `name`. */
  initials?: string;
};

let {
  name,
  userId,
  variant,
  shape,
  organization,
  size,
  initials,
  class: className,
  ...rest
}: Props = $props();

const resolvedShape = $derived(shape ?? (organization ? "square" : "circle"));
</script>

<span
  class={cn(avatar({ size, shape: resolvedShape }), className)}
  style={fieldStyle(avatarField(userId, variant))}
  aria-hidden="true"
  {...rest}
>{initials ?? initialsOf(name)}</span>
