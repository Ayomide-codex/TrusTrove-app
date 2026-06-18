export type { Invoice, InvoiceStatus, PoolStats, LPPosition, Profile, AssetType } from '@trusttrove/sdk';

export interface TxHistoryItem {
  id: string;
  type: string;
  amount?: string;
  token?: string;
  timestamp: number;
  hash: string;
  status: 'success' | 'failed';
}
