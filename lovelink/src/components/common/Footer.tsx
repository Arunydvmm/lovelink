import React from 'react';
import { Heart, Lock, ShieldCheck, Sparkles, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-2xl font-bold font-display text-white">LoveLink</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              LoveLink is a premium Digital Surprise Builder. Create breathtaking, interactive surprise web pages for proposals, anniversaries, birthdays, and special romantic moments in under 5 minutes.
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Safe & Instant Digital Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Occasions</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('templates')} className="hover:text-rose-400 transition-colors">Girlfriend Day Surprises</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-rose-400 transition-colors">Boyfriend Day Cards</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-rose-400 transition-colors">Romantic Proposals</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-rose-400 transition-colors">Anniversary Timelines</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-rose-400 transition-colors">Interactive Birthday Cakes</button></li>
            </ul>
          </div>

          {/* Legal CMS Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('legal', 'terms')} className="hover:text-rose-400 transition-colors">Terms & Conditions</button></li>
              <li><button onClick={() => onNavigate('legal', 'privacy')} className="hover:text-rose-400 transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('legal', 'refund')} className="hover:text-rose-400 transition-colors">Refund & Cancellation Policy</button></li>
              <li><button onClick={() => onNavigate('legal', 'cookie')} className="hover:text-rose-400 transition-colors">Cookie Policy</button></li>
              <li><button onClick={() => onNavigate('legal', 'faq')} className="hover:text-rose-400 transition-colors">FAQ & Support</button></li>
            </ul>
          </div>

          {/* Contact / Admin */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('my-stories')} className="hover:text-rose-400 transition-colors">User Dashboard</button></li>
              <li><button onClick={() => onNavigate('admin')} className="hover:text-rose-400 transition-colors">Admin Portal & Visual Editor</button></li>
            </ul>
            <div className="mt-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs flex items-center gap-2">
              <Mail className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-slate-300 truncate">support@lovelink.app</span>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} LoveLink Inc. All rights reserved. Made with love for lovers everywhere.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-400" /> SSL Encrypted Checkout</span>
            <span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-400" /> Mobile First Experience</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
