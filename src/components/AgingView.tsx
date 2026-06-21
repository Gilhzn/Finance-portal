/**
 * AgingView (Section 9.5.3) — debt aging map by month. Each month is a
 * collapsible row that animates open (height: auto, opacity: 1) to reveal the
 * linked invoices. Severity drives the colour coding.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, TrendingDown, Download } from 'lucide-react';
import type { Invoice } from '../types';
import { cx, formatCurrency, daysOverdue, exportInvoicesCsv } from '../utils';
import { AGING_BUCKETS, INVOICES, TOTAL_OPEN_BALANCE, OPEN_INVOICES } from '../data';
import { ViewHeader, StatusBadge, StatTile, SecondaryButton } from './ui';

const SEVERITY: Record<string, { label: string; bar: string; chip: string; track: string }> = {
  current: {
    label: 'שוטף',
    bar: 'bg-emerald-500',
    chip: 'bg-emerald-50 text-emerald-600',
    track: 'bg-emerald-100',
  },
  warning: {
    label: 'אזהרה',
    bar: 'bg-orange-500',
    chip: 'bg-orange-50 text-orange-600',
    track: 'bg-orange-100',
  },
  danger: {
    label: 'סיכון גבוה',
    bar: 'bg-rose-500',
    chip: 'bg-rose-50 text-rose-600',
    track: 'bg-rose-100',
  },
};

export default function AgingView({ onOpenInvoice }: { onOpenInvoice: (inv: Invoice) => void }) {
  const [open, setOpen] = useState<string | null>(AGING_BUCKETS[0]?.month ?? null);
  const max = Math.max(...AGING_BUCKETS.map((b) => b.total));
  const byId = new Map(INVOICES.map((i) => [i.id, i]));

  const dangerTotal = AGING_BUCKETS.filter((b) => b.severity === 'danger').reduce(
    (a, b) => a + b.total,
    0,
  );

  return (
    <div>
      <ViewHeader
        title="מפת גיול חובות"
        subtitle="פילוח היתרה הפתוחה לפי חודשי התיישנות"
        icon={<TrendingDown className="h-5 w-5" />}
        action={
          <SecondaryButton onClick={() => exportInvoicesCsv(OPEN_INVOICES)}>
            <Download className="h-4 w-4" />
            ייצוא לאקסל
          </SecondaryButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="יתרה פתוחה כוללת" value={formatCurrency(TOTAL_OPEN_BALANCE)} tone="brand" />
        <StatTile label="בסיכון גבוה (90+ ימים)" value={formatCurrency(dangerTotal)} tone="danger" />
        <StatTile label="מסמכים פתוחים" value={String(OPEN_INVOICES.length)} mono />
      </div>

      <div className="space-y-3">
        {AGING_BUCKETS.map((bucket) => {
          const sev = SEVERITY[bucket.severity];
          const isOpen = open === bucket.month;
          const pct = Math.round((bucket.total / max) * 100);
          return (
            <div
              key={bucket.month}
              className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-[var(--shadow-premium)]"
            >
              <button
                onClick={() => setOpen(isOpen ? null : bucket.month)}
                className="flex min-h-[64px] w-full items-center gap-4 px-4 py-3 text-right transition-colors hover:bg-brand-50/60 sm:px-5"
              >
                <ChevronDown
                  className={cx(
                    'h-5 w-5 shrink-0 text-brand-400 transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
                <div className="w-24 shrink-0 sm:w-28">
                  <div className="truncate font-bold text-brand-950">{bucket.label}</div>
                  <span className={cx('inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold', sev.chip)}>
                    {sev.label}
                  </span>
                </div>
                <div className="flex-1">
                  <div className={cx('hidden h-2.5 w-full overflow-hidden rounded-full sm:block', sev.track)}>
                    <div className={cx('h-full rounded-full', sev.bar)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="shrink-0 text-left">
                  <div className="num text-base font-extrabold text-brand-950 sm:text-lg">
                    {formatCurrency(bucket.total)}
                  </div>
                  <div className="text-[11px] text-brand-500">{bucket.invoiceIds.length} מסמכים</div>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-brand-100 bg-brand-50/40"
                  >
                    <div className="divide-y divide-brand-100">
                      {bucket.invoiceIds.map((id) => {
                        const inv = byId.get(id);
                        if (!inv) return null;
                        const od = daysOverdue(inv.dueDate);
                        return (
                          <button
                            key={id}
                            onClick={() => onOpenInvoice(inv)}
                            className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 py-3 text-right transition-colors hover:bg-white sm:px-6"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="num truncate text-sm font-bold text-brand-900">{inv.id}</div>
                              <div className="truncate text-xs text-brand-500">{inv.customerName}</div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                              {od > 0 && (
                                <span className="num hidden rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600 sm:inline">
                                  {od} ימי איחור
                                </span>
                              )}
                              <span className="num text-sm font-bold text-brand-950">
                                {formatCurrency(inv.openAmount)}
                              </span>
                              <StatusBadge status={inv.status} />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
