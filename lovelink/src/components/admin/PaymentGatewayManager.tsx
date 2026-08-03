import React, { useState } from 'react';
import { PaymentGatewayConfig, CloudinaryConfig } from '../../types';
import { store } from '../../lib/store';
import { CloudinaryUploader } from '../common/CloudinaryUploader';
import { CreditCard, Smartphone, ShieldCheck, Sparkles, Save, CheckCircle2, QrCode, Image as ImageIcon } from 'lucide-react';

export const PaymentGatewayManager: React.FC = () => {
  const [payConfig, setPayConfig] = useState<PaymentGatewayConfig>(() => store.getPaymentConfig());
  const [cldConfig, setCldConfig] = useState<CloudinaryConfig>(() => store.getCloudinaryConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    store.savePaymentConfig(payConfig);
    store.saveCloudinaryConfig(cldConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-rose-500" />
            Payment Gateway & Cloudinary Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure Indian Rupee (INR ₹) UPI / QR Code parameters, Razorpay Keys, and Cloudinary media cloud.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" /> Settings saved successfully! Payment gateway & Cloudinary are active.
        </div>
      )}

      {/* 1. UPI & QR Code Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">UPI & QR Payment Config (Rupees ₹)</h3>
              <p className="text-xs text-slate-500">Allow customers to pay directly via GPay, PhonePe, Paytm, or BHIM UPI.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={payConfig.upiEnabled}
              onChange={(e) => setPayConfig({ ...payConfig, upiEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Admin UPI ID (Payee VPA) *
            </label>
            <input
              type="text"
              value={payConfig.upiId}
              onChange={(e) => setPayConfig({ ...payConfig, upiId: e.target.value })}
              placeholder="e.g. lovelink@upi or 9876543210@okicici"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-rose-600 dark:text-rose-400"
            />
            <p className="text-[10px] text-slate-400 mt-1">This UPI ID will be shown on customer checkout.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Merchant / Payee Name *
            </label>
            <input
              type="text"
              value={payConfig.upiName}
              onChange={(e) => setPayConfig({ ...payConfig, upiName: e.target.value })}
              placeholder="e.g. LoveLink Surprises"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <CloudinaryUploader
              label="Admin Custom UPI QR Code Image (Upload via Cloudinary)"
              value={payConfig.upiQrCodeUrl || ''}
              onUploadSuccess={(url) => setPayConfig({ ...payConfig, upiQrCodeUrl: url })}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Customer Payment Instructions
            </label>
            <textarea
              rows={3}
              value={payConfig.instructions || ''}
              onChange={(e) => setPayConfig({ ...payConfig, instructions: e.target.value })}
              placeholder="Scan QR or send payment to UPI ID. Enter UTR reference number after payment."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 2. Razorpay / Cards Gateway Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Razorpay & Cards Integration</h3>
              <p className="text-xs text-slate-500">Enable automatic card & netbanking payment checkout.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={payConfig.razorpayEnabled}
              onChange={(e) => setPayConfig({ ...payConfig, razorpayEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Razorpay Key ID
            </label>
            <input
              type="text"
              value={payConfig.razorpayKeyId || ''}
              onChange={(e) => setPayConfig({ ...payConfig, razorpayKeyId: e.target.value })}
              placeholder="rzp_live_xxxxxxxxxxxxx"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Razorpay Key Secret
            </label>
            <input
              type="password"
              value={payConfig.razorpayKeySecret || ''}
              onChange={(e) => setPayConfig({ ...payConfig, razorpayKeySecret: e.target.value })}
              placeholder="••••••••••••••••"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* 3. Cloudinary Integration Settings */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-rose-100 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cloudinary Image & Media Cloud</h3>
              <p className="text-xs text-slate-500">Configure Cloudinary cloud name & unsigned upload preset for fast image hosting.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={cldConfig.enabled}
              onChange={(e) => setCldConfig({ ...cldConfig, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Cloudinary Cloud Name *
            </label>
            <input
              type="text"
              value={cldConfig.cloudName}
              onChange={(e) => setCldConfig({ ...cldConfig, cloudName: e.target.value })}
              placeholder="e.g. lovelink-cloud"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-purple-600 dark:text-purple-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
              Upload Preset (Unsigned) *
            </label>
            <input
              type="text"
              value={cldConfig.uploadPreset}
              onChange={(e) => setCldConfig({ ...cldConfig, uploadPreset: e.target.value })}
              placeholder="e.g. lovelink_preset"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Cloudinary Live Test Box */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">
            Test Cloudinary Upload Widget
          </h4>
          <CloudinaryUploader
            label="Upload Test Photo to Cloudinary"
            onUploadSuccess={(url) => alert(`Cloudinary Upload Success! Asset URL: ${url}`)}
          />
        </div>
      </div>
    </div>
  );
};
