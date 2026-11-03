// Actions
export { default as Button } from "./components/button/button.svelte";
export { default as Link } from "./components/link/link.svelte";

// Inputs
export { default as Checkbox } from "./components/checkbox/checkbox.svelte";
export { default as Combobox } from "./components/combobox/combobox.svelte";
export type { ComboboxItem } from "./components/combobox/types.ts";
export { default as Field } from "./components/field/field.svelte";
export { default as FileUpload } from "./components/file-upload/file-upload.svelte";
export type {
  FileUploadFile,
  FileUploadStatus,
} from "./components/file-upload/types.ts";
export { default as Input } from "./components/input/input.svelte";
export type {
  InputSize,
  InputType,
  InputVariant,
} from "./components/input/types.ts";
export { default as InputGroup } from "./components/input-group/input-group.svelte";
export { default as InputOtp } from "./components/input-otp/input-otp.svelte";
export type {
  InputOtpFormat,
  InputOtpVariant,
} from "./components/input-otp/types.ts";
export { default as ResultOption } from "./components/result-option/result-option.svelte";
export { default as SearchInput } from "./components/search-input/search-input.svelte";
export { default as SegmentedControl } from "./components/segmented-control/segmented-control.svelte";
export type {
  SegmentedControlItem,
  SegmentedControlSize,
} from "./components/segmented-control/types.ts";
export { default as Select } from "./components/select/select.svelte";
export type { SelectGroup, SelectItem } from "./components/select/types.ts";
export { default as Textarea } from "./components/textarea/textarea.svelte";
// PhoneInput has its own entry point (`./phone-input`): its metadata and flags weigh ~500 KB.

// Feedback
export { default as Alert } from "./components/alert/alert.svelte";
export { default as Badge } from "./components/badge/badge.svelte";
export { default as Callout } from "./components/callout/callout.svelte";
export { default as Dot } from "./components/dot/dot.svelte";
export type { DotIntent } from "./components/dot/types.ts";
export { default as Progress } from "./components/progress/progress.svelte";
export { default as SignalRow } from "./components/signal-row/signal-row.svelte";
export type { SignalRowSeverity } from "./components/signal-row/types.ts";
export { default as Spinner } from "./components/spinner/spinner.svelte";
export { default as Status } from "./components/status/status.svelte";

// Data display
export { default as Avatar } from "./components/avatar/avatar.svelte";
export type { AvatarVariant } from "./components/avatar/field.ts";
export { default as ChainPath } from "./components/chain-path/chain-path.svelte";
export { default as Collapsible } from "./components/collapsible/collapsible.svelte";
export { default as DataList } from "./components/data-list/data-list.svelte";
export type { DataListEntry } from "./components/data-list/types.ts";
export { default as DocumentPreview } from "./components/document-preview/document-preview.svelte";
export type { DocumentSection } from "./components/document-preview/types.ts";
export { default as Eyebrow } from "./components/eyebrow/eyebrow.svelte";
export { default as GlossaryTerm } from "./components/glossary-term/glossary-term.svelte";
export { default as Icon } from "./components/icon/icon.svelte";
export type { IconGlyph } from "./components/icon/glyphs.ts";
export { default as IconCircle } from "./components/icon-circle/icon-circle.svelte";
export type { IconCircleIntent } from "./components/icon-circle/types.ts";
export { default as InfoCard } from "./components/info-card/info-card.svelte";
export { default as ListItem } from "./components/list-item/list-item.svelte";
export { default as LockRow } from "./components/lock-row/lock-row.svelte";
export { default as TierChip } from "./components/tier-chip/tier-chip.svelte";
export type { TierChipTier } from "./components/tier-chip/types.ts";
export { default as UserChip } from "./components/user-chip/user-chip.svelte";
export { default as VerdictActions } from "./components/verdict-actions/verdict-actions.svelte";
export type { Verdict } from "./components/verdict-actions/types.ts";

// Navigation
export { default as Header } from "./components/header/header.svelte";
export type { HeaderLink } from "./components/header/types.ts";
export { default as MenuToggle } from "./components/menu-toggle/menu-toggle.svelte";
export { default as NavRail } from "./components/nav-rail/nav-rail.svelte";
export { NAV_RAIL_BAR_HEIGHT } from "./components/nav-rail/types.ts";
export type { NavRailItem, NavRailUser } from "./components/nav-rail/types.ts";
export { default as OptionCard } from "./components/option-card/option-card.svelte";
export { default as PageHeader } from "./components/page-header/page-header.svelte";
export { default as StepList } from "./components/step-list/step-list.svelte";
export type {
  StepListStatus,
  StepListStep,
} from "./components/step-list/types.ts";
export { default as Stepper } from "./components/stepper/stepper.svelte";
export type { StepperStatus, StepperStep } from "./components/stepper/types.ts";
export { default as Tab } from "./components/tab/tab.svelte";
export { default as TableOfContents } from "./components/table-of-contents/table-of-contents.svelte";
export type { TableOfContentsItem } from "./components/table-of-contents/types.ts";
export { default as Tabs } from "./components/tabs/tabs.svelte";

// Overlays
export { default as BottomSheet } from "./components/bottom-sheet/bottom-sheet.svelte";
export { default as NavDrawer } from "./components/nav-drawer/nav-drawer.svelte";
export { default as Popover } from "./components/popover/popover.svelte";
export type { PopoverClose } from "./components/popover/types.ts";
export { default as Tooltip } from "./components/tooltip/tooltip.svelte";

// Layout
export { default as Container } from "./components/container/container.svelte";
export { default as Separator } from "./components/separator/separator.svelte";
export { default as SidePanel } from "./components/side-panel/side-panel.svelte";
export { default as Stack } from "./components/stack/stack.svelte";

// Typography
export { default as CodeBlock } from "./components/code-block/code-block.svelte";
export type { CodeBlockTab } from "./components/code-block/types.ts";
export { default as InlineCode } from "./components/inline-code/inline-code.svelte";
export { default as Kbd } from "./components/kbd/kbd.svelte";
export { default as Text } from "./components/text/text.svelte";

// Attachments
export {
  expand,
  type ExpandParams,
} from "./attachments/expand/expand.svelte.ts";
export {
  focusTrap,
  type FocusTrapParams,
} from "./attachments/focus-trap/focus-trap.svelte.ts";
export { gravity } from "./attachments/gravity/gravity.svelte.ts";
export type {
  ForceShape,
  GravityOptions,
  GravityParameter,
} from "./attachments/gravity/types.ts";
export {
  indicator,
  type IndicatorKey,
} from "./attachments/indicator/indicator.svelte.ts";
export { mask } from "./attachments/mask/mask.ts";
export { patternMask } from "./attachments/mask/pattern.ts";
export type { MaskitoOptions } from "@maskito/core";
export { preventWheel } from "./attachments/prevent-wheel/prevent-wheel.ts";

// Utilities
export { cn } from "./utils/classes.ts";
export { ConfirmGesture } from "./utils/confirm-gesture.svelte.ts";
export { CopyFlash } from "./utils/copy-flash.svelte.ts";
export { initialsOf } from "./utils/initials.ts";
