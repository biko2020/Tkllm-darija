/**
 * @tkllm/ui — Shared Design System
 *
 * React component library used by web-contributor and web-b2b.
 * Built on Tailwind CSS + class-variance-authority (CVA).
 *
 * Architecture:
 *  - Primitive components (Button, Input, Badge, …) — generic, headless-style
 *  - Domain components  (AudioRecorder, TaskCard, QualityBadge, …) — Darija-specific
 *  - Layout components  (Shell, Sidebar, PageHeader, …)
 *
 * All components are server-component-safe by default.
 * Client-only components are explicitly marked with 'use client'.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

export { Button, type ButtonProps } from './components/button';
export { Input, type InputProps } from './components/input';
export { Textarea, type TextareaProps } from './components/textarea';
export { Badge, type BadgeProps } from './components/badge';
export { Avatar, type AvatarProps } from './components/avatar';
export { Card, CardHeader, CardBody, CardFooter } from './components/card';
export { Spinner, type SpinnerProps } from './components/spinner';
export { Alert, type AlertProps, type AlertVariant } from './components/alert';
export { Progress, type ProgressProps } from './components/progress';
export { Modal, type ModalProps } from './components/modal';
export { Toast, useToast } from './components/toast';
export { Tabs, TabList, Tab, TabPanel } from './components/tabs';
export { Select, type SelectOption } from './components/select';
export { Checkbox } from './components/checkbox';
export { Radio, RadioGroup } from './components/radio';
export { Switch } from './components/switch';
export { Tooltip } from './components/tooltip';
export { Skeleton } from './components/skeleton';
export { Divider } from './components/divider';

// ─────────────────────────────────────────────────────────────────────────────
// Domain components
// ─────────────────────────────────────────────────────────────────────────────

/** Audio recording widget — mobile-first, works via browser MediaRecorder API */
export { AudioRecorder, type AudioRecorderProps } from './components/domain/audio-recorder';

/** Displays a contributor task with prompt, type, domain, reward info */
export { TaskCard, type TaskCardProps } from './components/domain/task-card';

/** Quality score display with colour-coded rating (0–1 scale) */
export { QualityBadge, type QualityBadgeProps } from './components/domain/quality-badge';

/** Contributor earnings card showing balance, pending, streak */
export { WalletCard, type WalletCardProps } from './components/domain/wallet-card';

/** Leaderboard row — rank, display name, region flag, earnings */
export { LeaderboardRow, type LeaderboardRowProps } from './components/domain/leaderboard-row';

/** Streak display with flame icon and day counter */
export { StreakIndicator, type StreakIndicatorProps } from './components/domain/streak-indicator';

/** Consent toggle component for CNDP-compliant consent collection */
export { ConsentToggle, type ConsentToggleProps } from './components/domain/consent-toggle';

/** Dataset card for B2B portal — type, size, version, download button */
export { DatasetCard, type DatasetCardProps } from './components/domain/dataset-card';

/** Region map of Morocco — clickable for filtering */
export { MoroccoRegionSelector, type MoroccoRegionSelectorProps } from './components/domain/morocco-region-selector';

/** Dialect chip — colour-coded by region for demographic tagging */
export { DialectChip, type DialectChipProps } from './components/domain/dialect-chip';

// ─────────────────────────────────────────────────────────────────────────────
// Layout components
// ─────────────────────────────────────────────────────────────────────────────

export { Shell, type ShellProps } from './components/layout/shell';
export { Sidebar, type SidebarProps, type SidebarItem } from './components/layout/sidebar';
export { PageHeader, type PageHeaderProps } from './components/layout/page-header';
export { EmptyState, type EmptyStateProps } from './components/layout/empty-state';
export { ErrorBoundary } from './components/layout/error-boundary';
export { LoadingScreen } from './components/layout/loading-screen';

// ─────────────────────────────────────────────────────────────────────────────
// Hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Audio recording hook wrapping MediaRecorder with stop/pause/resume */
export { useAudioRecorder, type UseAudioRecorderReturn } from './hooks/use-audio-recorder';

/** Responsive breakpoint detection */
export { useBreakpoint } from './hooks/use-breakpoint';

/** Clipboard copy with success feedback */
export { useCopyToClipboard } from './hooks/use-copy-to-clipboard';

/** Local storage with SSR safety */
export { useLocalStorage } from './hooks/use-local-storage';

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

export { cn } from './lib/cn';
export { formatMAD } from './lib/format-mad';
export { formatDuration } from './lib/format-duration';
export { formatRelativeTime } from './lib/format-relative-time';
export { getRegionLabel } from './lib/region-labels';
export { getDialectLabel } from './lib/dialect-labels';
export { getLanguageLabel } from './lib/language-labels';
export { qualityColor, qualityLabel } from './lib/quality-helpers';

// ─────────────────────────────────────────────────────────────────────────────
// Tokens / theme
// ─────────────────────────────────────────────────────────────────────────────

export { colors } from './tokens/colors';
export { typography } from './tokens/typography';
export { spacing } from './tokens/spacing';