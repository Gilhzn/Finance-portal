/**
 * LedgerView (Section 9.5.4) — accounting ledger card with dense, readable rows.
 * Clicking a row that links to a document opens its visual replica instantly.
 */

import { BookOpen, Download, FileSearch } from 'lucide-react';
import type { Invoice } from '../types';
import { cx, formatCurrency, formatDate, exportLedgerCsv } from '../utils';
import { LEDGER_ENTRIES, LEDGER_BALANCE, ACCOUNT, INVOICES } from '../data';
import { ViewHeader, Card, StatTile, SecondaryButton } from './ui';

export default function LedgerView({ onOpenInvoice }: { onOpenInvoice: (inv: Invoice) => void }) {
  const byId = new Map(INVOICES.map((i) => [i.id, i]));
  const totalDebit = LEDGER_ENTRIES.reduce((a, e) => a + e.debit, 0);
  const totalCredit = LEDGER_ENTRIES.reduce((a, e) => a + e.credit, 0);

  return (
    <div>
      <ViewHeader
        title="כרטסת הנהלת חשבונות"
        subtitle={`${ACCOUNT.name} · ע.מ ${ACCOUNT.taxId}`}
        icon={<BookOpen className="h-5 w-5" />}
        action={
          <SecondaryButton onClick={() => exportLedgerCsv(LEDGER_ENTRIES)}>
            <Download className="h-4 w-4" />
            ייצוא לאקסל
          </SecondaryButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label='סך חובה (₪)' value={formatCurrency(totalDebit)} tone="neutral" />
        <StatTile label='סך זכות (₪)' value={formatCurrency(totalCredit)} tone="success" />
        <StatTile label="יתרה לתשלום" value={formatCurrency(LEDGER_BALANCE)} tone="danger" />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-slim">
          <table className="w-full min-w-[680px] text-right text-sm">
            <thead>
              <tr className="bg-brand-900 text-white">
                <th className="px-4 py-3 text-xs font-bold">תאריך</th>
                <th className="px-4 py-3 text-xs font-bold">אסמכתא</th>
                <th className="px-4 py-3 text-xs font-bold">תיאור תנועה</th>
                <th className="px-4 py-3 text-left text-xs font-bold">חובה</th>
                <th className="px-4 py-3 text-left text-xs font-bold">זכות</th>
                <th className="px-4 py-3 text-left text-xs font-bold">יתרה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100">
              {LEDGER_ENTRIES.map((e) => {
                const linked = e.linkedInvoiceId ? byId.get(e.linkedInvoiceId) : undefined;
                return (
                  <tr
                    key={e.id}
                    onClick={() => linked && onOpenInvoice(linked)}
                    className={cx(
                      'transition-colors',
                      linked ? 'cursor-pointer hover:bg-brand-50' : 'hover:bg-brand-50/40',
                    )}
                  >
                    <td className="num whitespace-nowrap px-4 py-3 text-xs text-brand-600">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="num text-xs font-bold text-brand-800">{e.reference}</span>
                        {linked && <FileSearch className="h-3.5 w-3.5 text-brand-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-700">{e.description}</td>
                    <td className="num px-4 py-3 text-left font-semibold text-brand-900">
                      {e.debit ? formatCurrency(e.debit) : '—'}
                    </td>
                    <td className="num px-4 py-3 text-left font-semibold text-emerald-600">
                      {e.credit ? formatCurrency(e.credit) : '—'}
                    </td>
                    <td className="num px-4 py-3 text-left font-extrabold text-brand-950">
                      {formatCurrency(e.balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-brand-900 bg-brand-50">
                <td colSpan={5} className="px-4 py-3 text-left text-sm font-black text-brand-950">
                  יתרת סגירה
                </td>
                <td className="num px-4 py-3 text-left text-base font-black text-brand-950">
                  {formatCurrency(LEDGER_BALANCE)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
      <p className="mt-3 text-center text-xs text-brand-400">
        לחיצה על שורה המקושרת למסמך תפתח העתק חזותי מלא שלו.
      </p>
    </div>
  );
}
