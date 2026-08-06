import React, { useState } from 'react';
import { Template } from '../../types';
import { DynamicRenderer } from '../renderer/DynamicRenderer';
import { Smartphone, Tablet, Monitor, X, Lock, CheckCircle } from 'lucide-react';

interface LivePreviewModalProps {
  template: Template;
  storyData: Record<string, any>;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
  template,
  storyData,
  onClose,
  onProceedToCheckout,
}) => {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const getContainerWidth = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'w-[375px] max-w-full h-[700px] max-h-[85vh] rounded-[40px] border-[12px] border-slate-900 shadow-2xl';
      case 'tablet':
        return 'w-[768px] max-w-full h-[750px] max-h-[85vh] rounded-[32px] border-[12px] border-slate-900 shadow-2xl';
      default:
        return 'w-full h-[85vh] rounded-2xl border border-slate-700 shadow-xl';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-5xl bg-slate-900/90 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
            Live Preview Mode
          </span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl gap-1">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deviceMode === 'mobile' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Mobile
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deviceMode === 'tablet' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" /> Tablet
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              deviceMode === 'desktop' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" /> Desktop
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close Preview"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Screen Frame Container */}
      <div className="my-auto flex items-center justify-center w-full max-w-6xl">
        <div className={`overflow-y-auto bg-slate-900 relative transition-all duration-300 ${getContainerWidth()}`}>
          <DynamicRenderer
            template={template}
            storyData={storyData}
            isWatermarkVisible={true}
          />
        </div>
      </div>

      {/* Bottom Floating Bar */}
      <div className="w-full max-w-2xl bg-slate-900/90 text-white backdrop-blur-md rounded-2xl p-3 flex items-center justify-between border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">
            {template.price === 0 ? 'Free Template' : `$${template.price} USD`}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Edit Fields
          </button>
          <button
            onClick={onProceedToCheckout}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Proceed to Checkout & Publish
          </button>
        </div>
      </div>
    </div>
  );
};
