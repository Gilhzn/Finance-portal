/**
 * Shared UI primitives used across all views — keeps the brand language
 * (Slate-Navy palette, premium shadows, RTL) consistent.
 */

import type { ReactNode } from 'react';
import { cx } from '../utils';
import type { InvoiceStatus, DeliveryStatus } from '../types';

/** Company wordmark used in the header and document headers. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cx(
          'flex h-9 w-9 items-center justify-center rounded-xl font-black text-lg',
          light ? 'bg-white text-brand-950' : 'bg-brand-950 text-white',
        )}
      >
        ח
      </div>
      <div className="leading-tight">
        <div className={cx('text-sm font-extrabold', light ? 'text-white' : 'text-brand-950')}>
          חלפים לישראל
        </div>
        <div className={cx('text-[10px] font-medium', light ? 'text-brand-200' : 'text-brand-500')}>
          פורטל פיננסי B2B
        </div>
      </div>
    </div>
  );
}

/** A soft white info card with the premium shadow. */
export function Card({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  return (
    <Tag
      className={cx(
        'rounded-2xl border border-brand-100 bg-white shadow-[var(--shadow-premium)]',
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-900 text-white">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-brand-950 sm:text-3xl">{title}</h1>
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
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'danger' | 'success' | 'brand';
  mono?: boolean;
}) {
  const toneCls = {
    neutral: 'text-brand-950',
    danger: 'text-rose-600',
    success: 'text-emerald-600',
    brand: 'text-brand-700',
  }[tone];
  return (
    <Card className="p-4">
      <div className="text-xs font-semibold text-brand-500">{label}</div>
      <div className={cx('mt-1 text-xl font-extrabold sm:text-2xl', toneCls, mono && 'num')}>
        {value}
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
        'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800 active:bg-brand-950',
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
        'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-bold text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-50',
        className,
      )}
    >
      {children}
    </button>
  );
}
