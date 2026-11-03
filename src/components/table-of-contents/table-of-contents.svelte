<script lang="ts">
import type { HTMLAttributes } from "svelte/elements";
import { prefersReducedMotion } from "svelte/motion";
import { cn } from "../../utils/classes.ts";
import type { TableOfContentsItem } from "./types.ts";

type Props = HTMLAttributes<HTMLElement> & {
  items: TableOfContentsItem[];
  /** Controls the active item; scroll-spy picks it otherwise. */
  activeId?: string;
  title?: string;
};

let {
  items,
  activeId,
  title = "On this page",
  class: className,
  ...rest
}: Props = $props();

let spied = $state<string>();
const active = $derived(activeId ?? spied ?? items[0]?.id);

function scrollTo(event: MouseEvent, id: string): void {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({
    behavior: prefersReducedMotion.current ? "auto" : "smooth",
    block: "start",
  });
  spied = id;
  history.replaceState(null, "", `#${id}`);
}

$effect(() => {
  const targets = items
    .map((item) => document.getElementById(item.id))
    .filter((target) => target !== null);
  if (targets.length === 0) return;

  // A section becomes active as it enters the top 30% of the viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) spied = entry.target.id;
      }
    },
    { rootMargin: "0px 0px -70% 0px" },
  );
  for (const target of targets) observer.observe(target);
  return () => observer.disconnect();
});
</script>

<nav
  aria-label={title}
  class={cn("flex flex-col gap-3.5", className)}
  {...rest}
>
  <p
    class="text-[11px] leading-[14px] font-semibold tracking-[0.66px] text-subtle-fg uppercase"
  >
    {title}
  </p>
  <ul class="flex flex-col gap-0.5">
    {#each items as item (item.id)}
      {@const current = active === item.id}
      <li>
        <a
          href={`#${item.id}`}
          aria-current={current ? "location" : undefined}
          onclick={(event) => scrollTo(event, item.id)}
          class="flex items-center gap-2.5 py-1"
        >
          <span
            class={[
              "h-4 w-0.5 shrink-0 rounded-full",
              current
                ? "bg-primary-solid forced-colors:bg-[Highlight]"
                : "bg-surface-muted forced-colors:bg-[GrayText]",
            ]}
          ></span>
          <span
            class={[
              "min-w-0 flex-1 text-[13px] leading-5 font-normal",
              current ? "text-fg" : "text-muted-fg",
            ]}
          >
            {item.label}
          </span>
        </a>
      </li>
    {/each}
  </ul>
</nav>
