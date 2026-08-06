import React, { useState, useEffect } from 'react';
import { Order } from '../../types';
import { store } from '../../lib/store';
import { ShoppingCart, CheckCircle2, RefreshCcw, DollarSign } from 'lucide-react';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    store.getOrders().then(setOrders);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Orders & Transaction Logs</h3>
        <p className="text-xs text-slate-500">View real-time customer purchases & payment status</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3.5">Transaction ID / UTR</th>
                <th className="p-3.5">User Email</th>
                <th className="p-3.5">Template</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Method</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300 font-bold">
                      <div>{order.transactionId}</div>
                      {order.utrNumber && <div className="text-[10px] text-rose-500">UTR: {order.utrNumber}</div>}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{order.userEmail}</td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{order.templateName}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">₹{order.totalAmount.toFixed(2)}</td>
                    <td className="p-3.5 uppercase font-medium text-slate-500">{order.paymentMethod}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
