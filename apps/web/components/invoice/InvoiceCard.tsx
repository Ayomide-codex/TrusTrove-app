import React, { useState } from 'react';
import { Invoice } from '@/types';
import { InvoiceStatus } from './InvoiceStatus';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { useWalletStore } from '@/store/wallet';
import { Calendar, ShieldAlert } from 'lucide-react';

interface InvoiceCardProps {
  invoice: Invoice;
  role?: 'issuer' | 'buyer' | 'lp';
}

export function InvoiceCard({ invoice, role }: InvoiceCardProps) {
  const { address } = useWalletStore();
  const { listInvoice, fundInvoice, shipInvoice, confirmDelivery, repayInvoice, defaultInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [discountBpsInput, setDiscountBpsInput] = useState('500'); // default 5%
  const [showListForm, setShowListForm] = useState(false);

  const formatUSDC = (amount: bigint) => {
    return (Number(amount) / 10_000_000).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const truncateAddr = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleList = async () => {
    setLoading(true);
    setError(null);
    try {
      const bps = parseInt(discountBpsInput, 10);
      if (isNaN(bps) || bps <= 0 || bps > 10000) {
        throw new Error('Discount basis points must be between 1 and 10,000 (100%)');
      }
      await listInvoice({ invoiceId: invoice.id, discountBps: bps });
      setShowListForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to list invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionFn: () => Promise<any>, errorMsg: string) => {
    setLoading(true);
    setError(null);
    try {
      await actionFn();
    } catch (err: any) {
      setError(err.message || errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = Date.now() / 1000 > invoice.dueDate;
  const showActions = !!address;

  return (
    <div className="relative overflow-hidden bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01] hover:border-slate-700/80 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-mono text-slate-500">ID: {truncateAddr(invoice.id)}</span>
          <h3 className="text-lg font-bold text-white mt-1">Invoice details</h3>
        </div>
        <InvoiceStatus status={invoice.status} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <span className="text-xs text-slate-400 block">Face Value</span>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            {formatUSDC(invoice.faceValue)}
          </span>
        </div>
        <div>
          <span className="text-xs text-slate-400 block">Discount Rate</span>
          <span className="text-xl font-bold text-white">
            {invoice.discountBps > 0 ? `${(invoice.discountBps / 100).toFixed(2)}%` : '—'}
          </span>
        </div>
      </div>

      <div className="space-y-2 border-t border-slate-800/60 pt-4 mb-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Issuer:</span>
          <span className="font-mono text-slate-300" title={invoice.issuer}>{truncateAddr(invoice.issuer)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Buyer:</span>
          <span className="font-mono text-slate-300" title={invoice.buyer}>{truncateAddr(invoice.buyer)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-500" /> Due Date:
          </span>
          <span className={`font-semibold ${isOverdue && invoice.status !== 'Repaid' ? 'text-rose-400' : 'text-slate-300'}`}>
            {new Date(invoice.dueDate * 1000).toLocaleDateString()}
            {isOverdue && invoice.status !== 'Repaid' && ' (Overdue)'}
          </span>
        </div>
      </div>

      {invoice.status !== 'Created' && invoice.status !== 'Listed' && (
        <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800/45 mb-6 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Funded Amount:</span>
            <span className="font-semibold text-emerald-400">{formatUSDC(invoice.fundedAmount)}</span>
          </div>
          {invoice.fundedAt && (
            <div className="flex justify-between">
              <span className="text-slate-500">Funded On:</span>
              <span className="text-slate-400">{new Date(invoice.fundedAt * 1000).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {showActions && (
        <div className="space-y-3">
          {invoice.status === 'Created' && role === 'issuer' && !showListForm && (
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-2"
              onClick={() => setShowListForm(true)}
            >
              Configure financing terms
            </Button>
          )}

          {showListForm && (
            <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Discount Rate (in Basis Points - e.g. 500 = 5%)</label>
                <input
                  type="number"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                  value={discountBpsInput}
                  onChange={(e) => setDiscountBpsInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-1"
                  onClick={() => setShowListForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs py-1"
                  onClick={handleList}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Confirm list'}
                </Button>
              </div>
            </div>
          )}

          {invoice.status === 'Listed' && role === 'lp' && (
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl py-2"
              onClick={() => handleAction(() => fundInvoice({ invoiceId: invoice.id }), 'Failed to fund invoice')}
              disabled={loading}
            >
              {loading ? 'Funding on-chain...' : 'Fund invoice'}
            </Button>
          )}

          {invoice.status === 'Funded' && role === 'issuer' && (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl py-2"
              onClick={() => handleAction(() => shipInvoice({ invoiceId: invoice.id }), 'Failed to mark as shipped')}
              disabled={loading}
            >
              {loading ? 'Updating status...' : 'Mark goods as shipped'}
            </Button>
          )}

          {invoice.status === 'Active' && role === 'buyer' && !invoice.buyerConfirmed && (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl py-2"
              onClick={() => handleAction(() => confirmDelivery({ invoiceId: invoice.id }), 'Failed to confirm delivery')}
              disabled={loading}
            >
              {loading ? 'Confirming...' : 'Confirm receipt of goods'}
            </Button>
          )}

          {(invoice.status === 'Confirmed' || invoice.status === 'Active') && role === 'buyer' && (
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-2"
              onClick={() => handleAction(() => repayInvoice({ invoiceId: invoice.id }), 'Failed to repay invoice')}
              disabled={loading}
            >
              {loading ? 'Repaying...' : 'Pay invoice'}
            </Button>
          )}

          {invoice.status === 'Active' && isOverdue && (
            <Button
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl py-2"
              onClick={() => handleAction(() => defaultInvoice({ invoiceId: invoice.id }), 'Failed to trigger default')}
              disabled={loading}
            >
              {loading ? 'Triggering default...' : 'Trigger default (Overdue)'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
