/**
 * Formatting + export helpers (Section 9.3).
 * Israeli currency (₪) formatting and Hebrew-friendly Excel CSV export with BOM.
 */

import type { Invoice, DeliveryNote, LedgerEntry } from './types';

export const VAT_RATE = 0.17;

const currencyFormatter = new Intl.NumberFormat('he-IL', {
  style: 'currency',
  currency: 'ILS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Israeli Shekel, e.g. ₪2,247,320.00 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

const numberFormatter = new Intl.NumberFormat('he-IL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a plain number with thousands separators and 2 decimals. */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Format an ISO date string (yyyy-mm-dd) to dd/mm/yyyy. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Number of whole days a document is past its due date (0 if not overdue). */
export function daysOverdue(dueDate: string, today = new Date()): number {
  const due = new Date(dueDate);
  const diff = today.getTime() - due.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}

const BOM = '﻿';

/** Escape a single CSV cell for Excel (handles quotes, commas, newlines). */
function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a CSV string from header + rows, with a Hebrew-compatible BOM. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(csvCell).join(','));
  return BOM + lines.join('\r\n');
}

/** Trigger a browser download of CSV content as an .csv file. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Export a list of invoices to an Excel-friendly CSV. */
export function exportInvoicesCsv(invoices: Invoice[]): void {
  const headers = [
    'מספר מסמך',
    'סוג',
    'תאריך',
    'לקוח',
    "ח\"פ",
    'סטטוס',
    'סכום לפני מע"מ',
    'מע"מ',
    'סה"כ',
    'יתרה פתוחה',
  ];
  const statusLabel: Record<string, string> = {
    paid: 'שולם',
    unpaid: 'לא שולם',
    overdue: 'באיחור',
    credit: 'זיכוי',
  };
  const rows = invoices.map((inv) => [
    inv.id,
    inv.kind === 'credit' ? 'זיכוי' : 'חשבונית',
    formatDate(inv.date),
    inv.customerName,
    inv.customerId,
    statusLabel[inv.status] ?? inv.status,
    inv.subtotal.toFixed(2),
    inv.vat.toFixed(2),
    inv.total.toFixed(2),
    inv.openAmount.toFixed(2),
  ]);
  downloadCsv('invoices_export', toCsv(headers, rows));
}

/** Export delivery notes to an Excel-friendly CSV. */
export function exportDeliveryNotesCsv(notes: DeliveryNote[]): void {
  const headers = [
    'מספר תעודה',
    'תאריך',
    'סטטוס',
    'לקוח',
    'נהג',
    'רכב',
    'יעד',
    'פריטים',
    'חתום ע"י',
  ];
  const rows = notes.map((n) => [
    n.id,
    formatDate(n.date),
    n.status === 'signed' ? 'חתום' : 'ממתין לחתימה',
    n.customerName,
    n.driverName,
    n.vehiclePlate,
    n.destination,
    n.itemCount,
    n.signedBy ?? '',
  ]);
  downloadCsv('delivery_notes_export', toCsv(headers, rows));
}

/** Export ledger entries to an Excel-friendly CSV. */
export function exportLedgerCsv(entries: LedgerEntry[]): void {
  const headers = ['תאריך', 'אסמכתא', 'תיאור', 'חובה', 'זכות', 'יתרה'];
  const rows = entries.map((e) => [
    formatDate(e.date),
    e.reference,
    e.description,
    e.debit ? e.debit.toFixed(2) : '',
    e.credit ? e.credit.toFixed(2) : '',
    e.balance.toFixed(2),
  ]);
  downloadCsv('ledger_export', toCsv(headers, rows));
}

/** Compose className strings, dropping falsy values. */
export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
