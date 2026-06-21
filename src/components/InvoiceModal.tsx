/**
 * InvoiceModal (Section 9.5) — a floating, pixel-perfect replica of the original
 * source document with a certified electronic signature. Includes print support
 * that strips the portal chrome (see @media print in index.css).
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import type { Invoice } from '../types';
import { COMPANY } from '../data';
import { formatCurrency, formatDate, formatNumber } from '../utils';
import { Logo } from './ui';

export default function InvoiceModal({
  invoice,
  onClose,
}: {
  invoice: Invoice | null;
  onClose: () => void;
}) {
  const isCredit = invoice?.kind === 'credit';

  return (
    <AnimatePresence>
      {invoice && (
        <motion.div
          className="no-print fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/40 p-4 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="print-area my-auto w-full max-w-3xl rounded-2xl bg-white shadow-[var(--shadow-luxurious)]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Toolbar — hidden on print */}
            <div className="no-print flex items-center justify-between rounded-t-2xl border-b border-brand-100 bg-brand-50 px-5 py-3">
              <span className="text-sm font-bold text-brand-700">
                {isCredit ? 'תעודת זיכוי' : 'חשבונית מס'} מקורית
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-900"
                >
                  <Printer className="h-3.5 w-3.5" />
                  הדפסה / PDF
                </button>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-500 transition-colors hover:bg-brand-100 hover:text-brand-900"
                  aria-label="סגירה"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document body */}
            <div className="p-6 sm:p-9">
              <div className="flex flex-col gap-4 border-b-2 border-brand-900 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Logo />
                  <div className="mt-3 text-xs leading-relaxed text-brand-600">
                    <div className="font-bold text-brand-900">{COMPANY.name}</div>
                    <div>{COMPANY.address}</div>
                    <div>
                      ח.פ <span className="num">{COMPANY.taxId}</span> · טל'{' '}
                      <span className="num">{COMPANY.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right sm:text-left">
                  <div className="text-xl font-extrabold text-brand-950">
                    {isCredit ? 'תעודת זיכוי' : 'חשבונית מס'}
                  </div>
                  <div className="num mt-1 text-lg font-bold text-brand-700">{invoice.id}</div>
                  <div className="mt-2 text-xs text-brand-600">
                    תאריך: <span className="num">{formatDate(invoice.date)}</span>
                  </div>
                  <div className="text-xs text-brand-600">
                    לתשלום עד: <span className="num">{formatDate(invoice.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Bill-to */}
              <div className="mt-5 flex flex-wrap justify-between gap-4 rounded-xl bg-brand-50 p-4">
                <div className="text-xs">
                  <div className="font-semibold text-brand-500">לכבוד</div>
                  <div className="mt-0.5 font-bold text-brand-950">{invoice.customerName}</div>
                  <div className="text-brand-600">{invoice.customerAddress}</div>
                  <div className="text-brand-600">
                    ע.מ / ח.פ <span className="num">{invoice.customerId}</span>
                  </div>
                </div>
                {invoice.poNumber && (
                  <div className="text-xs">
                    <div className="font-semibold text-brand-500">מספר הזמנה</div>
                    <div className="num mt-0.5 font-bold text-brand-950">{invoice.poNumber}</div>
                  </div>
                )}
              </div>

              {/* Lines */}
              <div className="mt-5 overflow-hidden rounded-xl border border-brand-100">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-brand-900 text-white">
                      <th className="px-3 py-2.5 text-xs font-bold">מק"ט</th>
                      <th className="px-3 py-2.5 text-xs font-bold">תיאור</th>
                      <th className="px-3 py-2.5 text-center text-xs font-bold">כמות</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold">מחיר יח'</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold">סה"כ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100">
                    {invoice.lines.map((line, i) => (
                      <tr key={i} className="text-brand-800">
                        <td className="num px-3 py-2.5 text-xs font-medium text-brand-600">{line.sku}</td>
                        <td className="px-3 py-2.5">
                          {line.description}
                          {line.plate && (
                            <span className="num mr-2 inline-block rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                              {line.plate}
                            </span>
                          )}
                        </td>
                        <td className="num px-3 py-2.5 text-center">{line.quantity}</td>
                        <td className="num px-3 py-2.5 text-left">{formatNumber(line.unitPrice)}</td>
                        <td className="num px-3 py-2.5 text-left font-semibold">
                          {formatNumber(line.quantity * line.unitPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-5 flex justify-start">
                <div className="w-full max-w-xs space-y-1.5 text-sm">
                  <div className="flex justify-between text-brand-600">
                    <span>סכום ביניים</span>
                    <span className="num font-semibold">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-brand-600">
                    <span>מע"מ 17%</span>
                    <span className="num font-semibold">{formatCurrency(invoice.vat)}</span>
                  </div>
                  <div className="flex justify-between border-t-2 border-brand-900 pt-2 text-base font-extrabold text-brand-950">
                    <span>סה"כ לתשלום</span>
                    <span className="num">{formatCurrency(invoice.total)}</span>
                  </div>
                </div>
              </div>

              {/* Certified signature */}
              <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                  <div className="text-xs">
                    <div className="font-bold">מסמך ממוחשב חתום דיגיטלית</div>
                    <div className="text-brand-500">
                      הופק ע"י {COMPANY.name} · מאושר רשות המסים
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div
                    className="text-2xl text-brand-800"
                    style={{ fontFamily: 'cursive' }}
                  >
                    א. חלפים
                  </div>
                  <div className="border-t border-brand-300 pt-1 text-[10px] text-brand-500">
                    חתימת מורשה
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
