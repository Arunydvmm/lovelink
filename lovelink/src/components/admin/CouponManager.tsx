import React, { useState, useEffect } from 'react';
import { Coupon } from '../../types';
import { store } from '../../lib/store';
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export const CouponManager: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCode, setNewCode] = useState('');
  const [discountValue, setDiscountValue] = useState(20);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const fetchCoupons = () => {
    store.getCoupons().then(setCoupons);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async () => {
    if (!newCode.trim()) return;
    const newCoupon: Coupon = {
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      code: newCode.toUpperCase().trim(),
      discountType,
      discountValue,
      maxUses: 100,
      usedCount: 0,
      isActive: true,
    };
    await store.saveCoupon(newCoupon);
    setNewCode('');
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    await store.deleteCoupon(id);
    fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Coupons & Promo Codes</h3>
        <p className="text-xs text-slate-500">Create discount offers for users</p>
      </div>

      {/* Create Coupon Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">Create New Coupon</h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            placeholder="COUPON CODE (e.g. LOVE50)"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="p-2.5 rounded-xl border font-mono uppercase bg-slate-50 dark:bg-slate-800"
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as any)}
            className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
          <input
            type="number"
            placeholder="Discount Value"
            value={discountValue}
            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
            className="p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-800"
          />
          <button
            onClick={handleCreateCoupon}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Coupon List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="font-mono text-base font-extrabold text-rose-600 dark:text-rose-400 block">
                {c.code}
              </span>
              <p className="text-xs text-slate-500 font-medium">
                {c.discountValue}{c.discountType === 'percentage' ? '%' : '₹'} OFF • Used: {c.usedCount}/{c.maxUses || '∞'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(c.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
