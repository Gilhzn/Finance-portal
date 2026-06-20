/**
 * InvoiceView (Section 9.5.6) — invoice & credit search across 4 separate
 * channels. Desktop split layout: a 5-column filter panel (right) and a
 * 7-column results + Excel export panel (left).
 */

import { useMemo, useState } from 'react';
import { FileText, Download, Search, Filter as FilterIcon } from 'lucide-react';
import type { Invoice, InvoiceStatus } from '../types';
import { cx, formatCurrency, formatDate, exportInvoicesCsv } from '../utils';
import { INVOICES } from '../data';
import { ViewHeader, Card, StatusBadge, PrimaryButton } from './ui';

type StatusFilter = 'all' | InvoiceStatus;

const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'unpaid', label: 'פתוח' },
  { key: 'overdue', label: 'באיחור' },
  { key: 'paid', label: 'שולם' },
  { key: 'credit', label: 'זיכוי' },
];

const CUSTOMERS = ['הכל', ...new Set(INVOICES.map((i) => i.customerName))];

export default function InvoiceView({ onOpenInvoice }: { onOpenInvoice: (inv: Invoice) => void }) {
  // Channel 1: document number, Channel 2: customer, Channel 3: status,
  // Channel 4: date range.
  const [docNumber, setDocNumber] = useState('');
  const [customer, setCustomer] = useState('הכל');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const results = useMemo(() => {
    return INVOICES.filter((inv) => {
      if (docNumber && !inv.id.toLowerCase().includes(docNumber.trim().toLowerCase())) return false;
      if (customer !== 'הכל' && inv.customerName !== customer) return false;
      if (status !== 'all' && inv.status !== status) return false;
      if (fromDate && inv.date < fromDate) return false;
      if (toDate && inv.date > toDate) return false;
      return true;
    });
  }, [docNumber, customer, status, fromDate, toDate]);

  const totalOpen = results.reduce((a, inv) => a + inv.openAmount, 0);

  const reset = () => {
    setDocNumber('');
    setCustomer('הכל');
    setStatus('all');
    setFromDate('');
    setToDate('');
  };

  return (
    <div>
      <ViewHeader
        title="איתור חשבוניות וזיכויים"
        subtitle="חיפוש לפי 4 ערוצים: מספר מסמך, לקוח, סטטוס וטווח תאריכים"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Filter panel — 5 cols (right in RTL) */}
        <div className="lg:col-span-5">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-bold text-brand-900">
              <FilterIcon className="h-4 w-4" />
              מסנני חיפוש
            </div>

            <div className="space-y-4">
              <Field label="ערוץ 1 · מספר מסמך">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-400" />
                  <input
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="לדוגמה: INV-2026-0612"
                    className="num w-full rounded-xl border border-brand-200 bg-brand-50 py-2.5 pr-9 pl-3 text-sm outline-none focus:border-brand-400"
                  />
                </div>
              </Field>

              <Field label="ערוץ 2 · לקוח">
                <select
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                >
                  {CUSTOMERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="ערוץ 3 · סטטוס מסמך">
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setStatus(s.key)}
                      className={cx(
                        'rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                        status === s.key
                          ? 'bg-brand-900 text-white'
                          : 'border border-brand-200 bg-white text-brand-600 hover:border-brand-300',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="ערוץ 4 · טווח תאריכים">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="num w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                  />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="num w-full rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
                  />
                </div>
              </Field>

              <button
                onClick={reset}
                className="w-full rounded-xl border border-brand-200 bg-white py-2.5 text-sm font-bold text-brand-600 transition-colors hover:bg-brand-50"
              >
                איפוס מסננים
              </button>
            </div>
          </Card>
        </div>

        {/* Results panel — 7 cols (left in RTL) */}
        <div className="lg:col-span-7">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 p-4">
              <div className="text-sm text-brand-600">
                נמצאו <span className="num font-extrabold text-brand-950">{results.length}</span>{' '}
                מסמכים · יתרה פתוחה{' '}
                <span className="num font-extrabold text-rose-600">{formatCurrency(totalOpen)}</span>
              </div>
              <PrimaryButton onClick={() => exportInvoicesCsv(results)} className="!py-2">
                <Download className="h-4 w-4" />
                ייצוא אקסל
              </PrimaryButton>
            </div>

            <div className="overflow-x-auto scrollbar-slim">
              <table className="w-full min-w-[560px] text-right text-sm">
                <thead>
                  <tr className="bg-brand-900 text-white">
                    <th className="px-4 py-3 text-xs font-bold">מסמך</th>
                    <th className="px-4 py-3 text-xs font-bold">לקוח</th>
                    <th className="px-4 py-3 text-xs font-bold">תאריך</th>
                    <th className="px-4 py-3 text-left text-xs font-bold">סה"כ</th>
                    <th className="px-4 py-3 text-center text-xs font-bold">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100">
                  {results.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => onOpenInvoice(inv)}
                      className="cursor-pointer transition-colors hover:bg-brand-50"
                    >
                      <td className="num px-4 py-3 font-bold text-brand-900">{inv.id}</td>
                      <td className="px-4 py-3 text-xs text-brand-600">{inv.customerName}</td>
                      <td className="num px-4 py-3 text-xs text-brand-600">{formatDate(inv.date)}</td>
                      <td
                        className={cx(
                          'num px-4 py-3 text-left font-extrabold',
                          inv.kind === 'credit' ? 'text-emerald-600' : 'text-brand-950',
                        )}
                      >
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {results.length === 0 && (
              <div className="py-12 text-center text-sm text-brand-400">
                לא נמצאו מסמכים התואמים את הסינון.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold text-brand-700">{label}</label>
      {children}
    </div>
  );
}
