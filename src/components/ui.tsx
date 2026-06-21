/**
 * Shared UI primitives used across all views — keeps the brand language
 * (Slate-Navy palette, premium shadows, RTL) consistent.
 */

import type { ReactNode } from 'react';
import { cx } from '../utils';
import type { InvoiceStatus, DeliveryStatus } from '../types';

/** Crisp SVG brand mark — a navy badge with an ascending finance bar-chart and
 *  an emerald growth accent. Scales sharply at any size. */
export function BrandMark({ size = 38 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="bm-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1a2f54" />
          <stop offset="1" stopColor="#0a1326" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#bm-bg)" />
      <rect x="0.5" y="0.5" width="39" height="39" rx="10.5" stroke="#ffffff" strokeOpacity="0.08" />
      {/* ascending bars */}
      <rect x="9" y="22" width="4.4" height="9" rx="1.4" fill="#6282b8" />
      <rect x="17.8" y="17" width="4.4" height="14" rx="1.4" fill="#b4c6e1" />
      <rect x="26.6" y="11" width="4.4" height="20" rx="1.4" fill="#ffffff" />
      {/* growth accent dot */}
      <circle cx="28.8" cy="9.2" r="2.6" fill="#16a34a" stroke="#0a1326" strokeWidth="1.4" />
    </svg>
  );
}

/** Company wordmark used in the header and document headers. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <div className="leading-tight">
        <div className={cx('text-sm font-extrabold tracking-tight', light ? 'text-white' : 'text-brand-950')}>
          חלפים לישראל
        </div>
        <div
          className={cx(
            'text-[10px] font-semibold uppercase tracking-[0.12em]',
            light ? 'text-brand-300' : 'text-brand-500',
          )}
        >
          Financial Portal
        </div>
      </div>
    </div>
  );
}

/** A soft white info card with the premium shadow. */
export function Card({
  children,
  className,
  hover = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  as?: 'div' | 'section' | 'article';
}) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-brand-100/80 bg-white shadow-[var(--shadow-premium)]',
        hover &&
          'transition-shadow duration-200 hover:border-brand-200 hover:shadow-[var(--shadow-luxurious)]',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

const INVOICE_STATUS: Record<InvoiceStatus, { label: string; cls: string }> = {
  paid: { label: 'שולם', cls: 'bg-emerald-50 text-emerald-600' },
  unpaid: { label: 'פתוח', cls: 'bg-brand-50 text-brand-700' },
  overdue: { label: 'באיחור', cls: 'bg-rose-50 text-rose-600' },
  credit: { label: 'זיכוי', cls: 'bg-emerald-50 text-emerald-600' },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const s = INVOICE_STATUS[status];
  return (
    <span className={cx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold', s.cls)}>
      {s.label}
    </span>
  );
}

export function DeliveryBadge({ status }: { status: DeliveryStatus }) {
  return status === 'signed' ? (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
      חתום
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
      ממתין לחתימה
    </span>
  );
}

/** Section title with optional subtitle, used at the top of each view. */
export function ViewHeader({
  title,
  subtitle,
  icon,
  action,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 text-white shadow-[var(--shadow-premium)] ring-1 ring-white/10">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-brand-950 sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm font-medium text-brand-500">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/** A labelled stat tile (currency aligned in mono). */
export function StatTile({
  label,
  value,
  tone = 'neutral',
  mono = true,
  icon,
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'danger' | 'success' | 'brand';
  mono?: boolean;
  icon?: ReactNode;
}) {
  const toneCls = {
    neutral: 'text-brand-950',
    danger: 'text-rose-600',
    success: 'text-emerald-600',
    brand: 'text-brand-700',
  }[tone];
  const accent = {
    neutral: 'bg-brand-100 text-brand-700',
    danger: 'bg-rose-50 text-rose-600',
    success: 'bg-emerald-50 text-emerald-600',
    brand: 'bg-brand-100 text-brand-700',
  }[tone];
  return (
    <Card className="flex items-center gap-3 p-4">
      {icon && (
        <div className={cx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', accent)}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="truncate text-xs font-semibold text-brand-500">{label}</div>
        <div className={cx('mt-0.5 text-xl font-extrabold sm:text-2xl', toneCls, mono && 'num')}>
          {value}
        </div>
      </div>
    </Card>
  );
}

/** Primary navy action button. */
export function PrimaryButton({
  children,
  onClick,
  className,
  type = 'button',
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-brand-800 hover:shadow-md active:scale-[0.98] active:bg-brand-950',
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Secondary light button. */
export function SecondaryButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition-all duration-150 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]',
        className,
      )}
    >
      {children}
    </button>
  );
}
