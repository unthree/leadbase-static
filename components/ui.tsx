"use client";

// Thin presentational wrappers over the frozen lb-* design system.
// No styles beyond lb-* classes + token-based inline values where the
// design system exposes CSS custom properties (e.g. score rings, meters).

import React, { useEffect, useRef } from "react";
import { icons, X } from "lucide-react";

export type IconName = keyof typeof icons;

// Accept both PascalCase lucide keys ("TrendingUp") and the kebab/lowercase
// names carried in fixtures ("trending-up", "target") — normalize to the key.
function toPascal(name: string): IconName {
  if (name in icons) return name as IconName;
  const pascal = name
    .split(/[-_\s]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  return (pascal in icons ? pascal : "Circle") as IconName;
}

export function Icon({ name, ...rest }: { name: IconName | string } & React.SVGProps<SVGSVGElement>) {
  const Cmp = icons[toPascal(name)];
  return <Cmp {...rest} />;
}

/* ----- Button ----- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet" | "danger" | "success" | "gradient";

export function Button({
  variant = "primary",
  size,
  full,
  iconLeft,
  iconRight,
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: "sm" | "lg";
  full?: boolean;
  iconLeft?: IconName;
  iconRight?: IconName;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = [
    "lb-btn",
    `lb-btn--${variant}`,
    size ? `lb-btn--${size}` : "",
    full ? "lb-btn--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={cls} {...rest}>
      {iconLeft ? <Icon name={iconLeft} /> : null}
      {children}
      {iconRight ? <Icon name={iconRight} /> : null}
    </button>
  );
}

export function IconButton({
  label,
  icon,
  dot,
  ...rest
}: { label: string; icon: IconName; dot?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <span className="lb-iconbtn-wrap">
      <button className="lb-iconbtn" aria-label={label} title={label} {...rest}>
        <Icon name={icon} />
      </button>
      {dot ? <span className="lb-iconbtn__dot" /> : null}
    </span>
  );
}

/* ----- Card ----- */
export function Card({
  flush,
  hover,
  stripe,
  className = "",
  children,
  ...rest
}: {
  flush?: boolean;
  hover?: boolean;
  stripe?: "swarm" | "flow" | "pulse";
} & React.HTMLAttributes<HTMLDivElement>) {
  const cls = ["lb-card", flush ? "lb-card--flush" : "", hover ? "lb-card--hover" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} {...rest}>
      {stripe ? <div className={`lb-card__stripe lb-card__stripe--${stripe}`} /> : null}
      {children}
    </div>
  );
}

export function CardHead({ title, sm, action }: { title: React.ReactNode; sm?: boolean; action?: React.ReactNode }) {
  return (
    <div className="lb-card__head">
      <h2 className={`lb-card__title${sm ? " lb-card__title--sm" : ""}`}>{title}</h2>
      {action}
    </div>
  );
}

/* ----- Badge ----- */
export type BadgeVariant = "neutral" | "brand" | "success" | "warning" | "danger" | "info" | "gradient";

export function Badge({
  variant = "neutral",
  icon,
  spin,
  children,
}: {
  variant?: BadgeVariant;
  icon?: IconName;
  spin?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`lb-badge lb-badge--${variant}`}>
      {icon ? <Icon name={icon} className={spin ? "lb-spin" : undefined} /> : null}
      {children}
    </span>
  );
}

/* ----- Status pill ----- */
export type StatusKind = "ok" | "pending" | "bad" | "info" | "mute";

export function StatusPill({ status, label, pulse }: { status: StatusKind; label: string; pulse?: boolean }) {
  return (
    <span className={`lb-status lb-status--${status}`}>
      <span className={`lb-status__dot${pulse ? " lb-pulse" : ""}`} />
      {label}
    </span>
  );
}

export const BUSINESS_STATUS_PILL: Record<string, { status: StatusKind; pulse?: boolean }> = {
  researching: { status: "mute" },
  building: { status: "pending", pulse: true },
  testing: { status: "info" },
  active: { status: "ok", pulse: true },
  archived: { status: "mute" },
};

/* ----- Stat card ----- */
export function StatCard({
  label,
  value,
  delta,
  trend,
  sub,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  sub: string;
  icon: IconName;
}) {
  return (
    <div className="lb-card lb-stat-card">
      <div className="lb-stat-card__top">
        <span className="lb-stat-card__label">{label}</span>
        <IconChip tone="brand" icon={icon} />
      </div>
      <div className="lb-stat-card__value">{value}</div>
      <div className="lb-stat-card__meta">
        <span className={`lb-delta lb-delta--${trend}`}>
          <Icon name={trend === "up" ? "TrendingUp" : "TrendingDown"} />
          {delta}
        </span>
        {sub}
      </div>
    </div>
  );
}

/* ----- Score badge (SPEC §4.1 bands) ----- */
export function scoreBand(score: number): "hi" | "mid" | "low" | "muted" {
  if (score >= 85) return "hi";
  if (score >= 70) return "mid";
  if (score >= 50) return "low";
  return "muted";
}

export function ScoreBadge({ score, size = "sm", label }: { score: number; size?: "sm" | "md" | "lg"; label?: string }) {
  return (
    <span className={`lb-score lb-score--${scoreBand(score)}`}>
      <span
        className={`lb-score__ring lb-score__ring--${size}`}
        style={{ "--lb-score-val": score } as React.CSSProperties}
      >
        {score}
      </span>
      {label ? <span className="lb-score__label">{label}</span> : null}
    </span>
  );
}

/* ----- Icon chip ----- */
export type ChipTone = "brand" | "sky" | "violet" | "magenta" | "success" | "warning" | "gradient";

export function IconChip({ tone, icon, size }: { tone: ChipTone; icon: IconName | string; size?: "sm" | "lg" }) {
  return (
    <span className={`lb-icon-chip lb-icon-chip--${tone}${size ? ` lb-icon-chip--${size}` : ""}`}>
      <Icon name={icon} />
    </span>
  );
}

export const ACTIVITY_CHIP: Record<string, { tone: ChipTone; icon: IconName }> = {
  research: { tone: "sky", icon: "Radar" },
  build: { tone: "violet", icon: "Hammer" },
  leads: { tone: "brand", icon: "Users" },
  asset: { tone: "magenta", icon: "FileText" },
};

/* ----- Tag ----- */
export function Tag({ kind, children }: { kind: "think" | "plan" | "build" | "find" | "win" | "kill"; children: React.ReactNode }) {
  return <span className={`lb-tag lb-tag--${kind}`}>{children}</span>;
}

/* ----- Avatar ----- */
export function Avatar({ name, size = 32, status }: { name: string; size?: 24 | 32 | 34 | 40; status?: "online" | "away" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span className={`lb-avatar lb-avatar--${size}`}>
      {initials}
      {status ? <span className={`lb-avatar__status lb-avatar__status--${status}`} /> : null}
    </span>
  );
}

/* ----- Meter ----- */
export function Meter({ value, thin, tone }: { value: number; thin?: boolean; tone?: "gradient" | "success" | "warning" }) {
  const cls = ["lb-meter", thin ? "lb-meter--thin" : "", tone ? `lb-meter--${tone}` : ""].filter(Boolean).join(" ");
  return (
    <div className={cls} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="lb-meter__fill" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export const STATUS_PROGRESS: Record<string, number> = {
  researching: 25,
  building: 40,
  testing: 60,
  active: 100,
};

/* ----- Tabs ----- */
export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  pill,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  pill?: boolean;
}) {
  return (
    <div className={`lb-tabs${pill ? " lb-tabs--pill" : ""}`} role="tablist">
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={t.id === active}
          className={`lb-tabs__item${t.id === active ? " is-active" : ""}`}
          onClick={() => onChange(t.id)}
        >
          {t.icon ? <Icon name={t.icon} /> : null}
          {t.label}
          {typeof t.count === "number" ? <span className="lb-tabs__count">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/* ----- Callout / Meta / ActionRow / Activity ----- */
export function Callout({ icon, tone = "violet", children, compact }: { icon: IconName; tone?: ChipTone; children: React.ReactNode; compact?: boolean }) {
  return (
    <div className="lb-callout" style={compact ? { padding: "11px 12px" } : undefined}>
      <span className="lb-callout__icon">
        <IconChip tone={tone} icon={icon} />
      </span>
      <div>{children}</div>
    </div>
  );
}

export function MetaItem({ icon, label, children }: { icon: IconName; label: string; children: React.ReactNode }) {
  return (
    <div className="lb-meta">
      <span className="lb-meta__icon">
        <Icon name={icon} />
      </span>
      <div>
        <div className="lb-mono-label">{label}</div>
        <div className="lb-meta__value">{children}</div>
      </div>
    </div>
  );
}

export function ActionRow({
  tone = "brand",
  icon,
  title,
  meta,
  onClick,
}: {
  tone?: ChipTone;
  icon: IconName;
  title: string;
  meta: string;
  onClick?: () => void;
}) {
  return (
    <button className="lb-action-row" onClick={onClick}>
      <IconChip tone={tone} icon={icon} />
      <div>
        <div className="lb-action-row__title">{title}</div>
        <div className="lb-action-row__meta">{meta}</div>
      </div>
      <span className="lb-action-row__chevron">
        <Icon name="ArrowRight" />
      </span>
    </button>
  );
}

export function ActivityRow({ kind, text, time }: { kind: string; text: string; time: string }) {
  const chip = ACTIVITY_CHIP[kind] ?? ACTIVITY_CHIP.leads;
  return (
    <div className="lb-activity">
      <IconChip tone={chip.tone} icon={chip.icon} />
      <div>
        <div className="lb-activity__text">{text}</div>
        <div className="lb-activity__time">{time}</div>
      </div>
    </div>
  );
}

/* ----- Empty / Skeleton ----- */
export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: IconName;
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="lb-card lb-empty">
      <IconChip tone="brand" icon={icon} size="lg" />
      <div className="lb-empty__title">{title}</div>
      <div className="lb-empty__hint">{hint}</div>
      {action}
    </div>
  );
}

export function Skeleton({ height, width }: { height: number; width?: string }) {
  return <div className="lb-skeleton" style={{ height, width }} />;
}

/* ----- Modal (focus trap + Esc per SPEC §7) ----- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const focusables = ref.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const initial = ref.current?.querySelector<HTMLElement>("[data-autofocus]");
    initial?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="lb-modal-scrim" onClick={onClose}>
      <div
        className="lb-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lb-modal__header">
          {icon}
          <div>
            <h3 className="lb-modal__title">{title}</h3>
            {subtitle ? <p className="lb-modal__subtitle">{subtitle}</p> : null}
          </div>
          <span className="lb-modal__close">
            <button className="lb-iconbtn" aria-label="Close" onClick={onClose}>
              <X />
            </button>
          </span>
        </div>
        <div className="lb-modal__body">{children}</div>
        {footer ? <div className="lb-modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
