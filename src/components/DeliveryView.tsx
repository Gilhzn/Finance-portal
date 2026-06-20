/**
 * DeliveryView (Section 9.5.5) — delivery notes with drivers and digital
 * representative signatures. Signed = green, pending = orange. Cards link to the
 * matching invoice.
 */

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Truck, Download, User, Car, MapPin, FileText, PenLine } from 'lucide-react';
import type { Invoice, DeliveryStatus } from '../types';
import { cx, formatDate, exportDeliveryNotesCsv } from '../utils';
import { DELIVERY_NOTES, INVOICES } from '../data';
import { ViewHeader, Card, DeliveryBadge, StatTile, SecondaryButton } from './ui';

type Filter = 'all' | DeliveryStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'הכל' },
  { key: 'signed', label: 'חתום' },
  { key: 'pending', label: 'ממתין לחתימה' },
];

export default function DeliveryView({ onOpenInvoice }: { onOpenInvoice: (inv: Invoice) => void }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const byId = new Map(INVOICES.map((i) => [i.id, i]));

  const filtered = useMemo(() => {
    return DELIVERY_NOTES.filter((n) => {
      if (filter !== 'all' && n.status !== filter) return false;
      if (query) {
        const q = query.trim();
        return (
          n.id.includes(q) ||
          n.customerName.includes(q) ||
          n.driverName.includes(q) ||
          n.vehiclePlate.includes(q)
        );
      }
      return true;
    });
  }, [filter, query]);

  const pending = DELIVERY_NOTES.filter((n) => n.status === 'pending').length;

  return (
    <div>
      <ViewHeader
        title="תעודות משלוח"
        subtitle="נהגים, רכבי חלוקה וחתימות נציג דיגיטליות"
        icon={<Truck className="h-5 w-5" />}
        action={
          <SecondaryButton onClick={() => exportDeliveryNotesCsv(filtered)}>
            <Download className="h-4 w-4" />
            ייצוא לאקסל
          </SecondaryButton>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="סך תעודות" value={String(DELIVERY_NOTES.length)} mono />
        <StatTile
          label="חתומות"
          value={String(DELIVERY_NOTES.length - pending)}
          tone="success"
          mono
        />
        <StatTile label="ממתינות לחתימה" value={String(pending)} tone="danger" mono />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cx(
                'rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors',
                filter === f.key
                  ? 'bg-brand-900 text-white'
                  : 'border border-brand-200 bg-white text-brand-600 hover:border-brand-300',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מס' תעודה, לקוח, נהג או רכב..."
          className="w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 sm:w-80"
        />
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((note) => {
          const linked = note.linkedInvoiceId ? byId.get(note.linkedInvoiceId) : undefined;
          return (
            <motion.div
              key={note.id}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Card className="h-full p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="num text-lg font-black text-brand-950">{note.id}</div>
                    <div className="num text-xs text-brand-500">{formatDate(note.date)}</div>
                  </div>
                  <DeliveryBadge status={note.status} />
                </div>

                <div className="mt-3 text-sm font-bold text-brand-900">{note.customerName}</div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-brand-600">
                  <span className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-brand-400" /> {note.driverName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Car className="h-3.5 w-3.5 text-brand-400" />
                    <span className="num">{note.vehiclePlate}</span>
                  </span>
                  <span className="col-span-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-400" /> {note.destination}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-brand-100 pt-3">
                  {note.status === 'signed' ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <PenLine className="h-3.5 w-3.5" />
                      נחתם ע"י <span className="font-bold">{note.signedBy}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600">
                      <PenLine className="h-3.5 w-3.5" />
                      ממתין לחתימת נציג
                    </div>
                  )}
                  <span className="num text-xs font-semibold text-brand-500">
                    {note.itemCount} פריטים
                  </span>
                </div>

                {linked && (
                  <button
                    onClick={() => onOpenInvoice(linked)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-800"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    צפייה בחשבונית המקושרת {linked.id}
                  </button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center text-sm text-brand-400">
          לא נמצאו תעודות משלוח התואמות את החיפוש.
        </div>
      )}
    </div>
  );
}
