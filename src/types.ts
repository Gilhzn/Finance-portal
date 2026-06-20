/**
 * Core financial domain types for the Israel Parts financial portal.
 * Strong typing here prevents compilation errors across all views (Section 9.1).
 */

export type ViewKey =
  | 'landing'
  | 'menu'
  | 'aging'
  | 'ledger'
  | 'delivery'
  | 'invoices'
  | 'catalog';

/** Whether a financial document is a debit (invoice) or credit (זיכוי). */
export type DocKind = 'invoice' | 'credit';

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'credit';

export interface InvoiceLine {
  sku: string; // מק"ט
  description: string;
  quantity: number;
  unitPrice: number; // לפני מע"מ
  /** Optional vehicle license plate this part was fitted to. */
  plate?: string;
}

export interface Invoice {
  id: string; // מספר חשבונית
  kind: DocKind;
  date: string; // ISO yyyy-mm-dd
  dueDate: string; // תאריך לתשלום
  status: InvoiceStatus;
  customerName: string;
  customerId: string; // ח"פ / עוסק מורשה
  customerAddress: string;
  lines: InvoiceLine[];
  /** Net total before VAT. Negative for credits. */
  subtotal: number;
  vat: number; // 17%
  total: number; // including VAT
  /** Open (unpaid) amount. 0 when fully paid. */
  openAmount: number;
  poNumber?: string; // מספר הזמנה
}

/** A single line in the accounting ledger card (כרטיסת חשבון). */
export interface LedgerEntry {
  id: string;
  date: string;
  reference: string; // אסמכתא — invoice / receipt number
  description: string;
  /** Document this row reconciles to, for the click-to-preview feature. */
  linkedInvoiceId?: string;
  debit: number; // חובה
  credit: number; // זכות
  balance: number; // יתרה מצטברת
}

export type DeliveryStatus = 'signed' | 'pending';

export interface DeliveryNote {
  id: string; // מספר תעודת משלוח
  date: string;
  status: DeliveryStatus;
  customerName: string;
  customerId: string;
  driverName: string; // שם הנהג
  vehiclePlate: string; // רכב חלוקה
  destination: string;
  /** Name of the signing representative when status is signed. */
  signedBy?: string;
  signedAt?: string;
  linkedInvoiceId?: string;
  lines: InvoiceLine[];
  itemCount: number;
}

export interface CatalogItem {
  sku: string; // מק"ט
  name: string;
  category: string;
  brand: string;
  price: number; // לפני מע"מ
  inStock: number;
  imageUrl: string;
  description: string;
}

export interface CartLine {
  item: CatalogItem;
  quantity: number;
}

/** One bucket in the aging map (מפת גיול חובות). */
export interface AgingBucket {
  /** Month label, e.g. "2026-04". */
  month: string;
  label: string; // human label, e.g. "אפריל 2026"
  total: number; // sum of open invoices in this bucket
  /** Danger level drives the colour coding of the bucket. */
  severity: 'current' | 'warning' | 'danger';
  invoiceIds: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
