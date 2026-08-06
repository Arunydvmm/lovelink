import React, { useEffect, useState } from 'react';
import { generateQRCode } from '../../lib/qrCode';
import { Story } from '../../types';
import { QrCode, Copy, Share2, Download, ExternalLink, Check, Heart, Sparkles, X } from 'lucide-react';

interface QrModalProps {
  story: Story;
  onClose: () => void;
  onViewStory: (slug: string) => void;
}

export const QrModal: React.FC<QrModalProps> = ({ story, onClose, onViewStory }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const fullUrl = `${window.location.origin}/#story/${story.slug || story.id}`;

  useEffect(() => {
    generateQRCode(fullUrl).then(setQrDataUrl);
  }, [fullUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const msg = `Hey ${story.recipientName}! I created a special surprise page for you on LoveLink ❤️ Open it here: ${fullUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `LoveLink_Surprise_QR_${story.recipientName}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-rose-100 dark:border-slate-800 text-center relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6 animate-bounce" />
        </div>

        <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-1">
          Your Surprise is Published! 🎉
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Share this unique QR code or link with <span className="font-bold text-rose-500">{story.recipientName}</span>
        </p>

        {/* QR Code Display */}
        <div className="bg-rose-50 dark:bg-slate-800/80 p-6 rounded-3xl border-2 border-rose-200 dark:border-slate-700 inline-block shadow-inner mb-6">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Surprise QR Code" className="w-48 h-48 mx-auto rounded-xl shadow-md" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-slate-400">
              Generating QR...
            </div>
          )}
          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest block mt-3">
            Scan with smartphone camera
          </span>
        </div>

        {/* Link box */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border mb-4">
          <input
            type="text"
            readOnly
            value={fullUrl}
            className="bg-transparent text-xs text-slate-700 dark:text-slate-300 flex-1 truncate px-2 font-mono outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center gap-1 shrink-0 hover:bg-rose-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-colors"
          >
            <Share2 className="w-4 h-4" /> Share WhatsApp
          </button>
          <button
            onClick={handleDownloadQR}
            className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
        </div>

        {/* View Story Button */}
        <button
          onClick={() => onViewStory(story.slug || story.id)}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
        >
          <ExternalLink className="w-4 h-4" /> Open Public Surprise Page
        </button>
      </div>
    </div>
  );
};
