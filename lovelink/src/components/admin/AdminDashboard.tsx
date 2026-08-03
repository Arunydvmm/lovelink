import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '../../types';
import { store } from '../../lib/store';
import { TemplateManager } from './TemplateManager';
import { OrderManager } from './OrderManager';
import { CouponManager } from './CouponManager';
import { LegalCmsManager } from './LegalCmsManager';
import { AnnouncementManager } from './AnnouncementManager';
import { PaymentGatewayManager } from './PaymentGatewayManager';
import { EmailTemplateManager } from './EmailTemplateManager';
import { IndianRupee, TrendingUp, Users, Heart, Eye, Tag, FileText, Megaphone, Layers, ShoppingBag, ShieldCheck, CreditCard, Lock, LogOut, KeyRound, UserCheck, Sparkles, Mail } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'orders' | 'coupons' | 'legal' | 'announcements' | 'payment' | 'email'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  // Environment variable credentials
  const envAdminUsername = ((import.meta as any).env?.VITE_ADMIN_USERNAME as string) || 'admin';
  const envAdminPassword = ((import.meta as any).env?.VITE_ADMIN_PASSWORD as string) || 'lovelink123';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('lovelink_admin_authenticated') === 'true';
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      store.getAnalytics().then(setAnalytics);
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === envAdminUsername && passwordInput === envAdminPassword) {
      sessionStorage.setItem('lovelink_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid Username or Password. Please check environment variables.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('lovelink_admin_authenticated');
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Render Login Gate if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-rose-100 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              Admin Portal Security
            </h2>
            <p className="text-xs text-slate-500">
              Enter your credentials to access LoveLink Enterprise Control Panel.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-rose-500" /> Admin Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter admin username"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-rose-500" /> Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 dark:text-red-400 text-xs font-semibold text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Authenticate & Access Admin
            </button>
          </form>

          {/* Environment Variable Status Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> ENV Credential Status:
            </div>
            <p>
              Username: <code className="text-rose-600 dark:text-rose-400 font-mono font-bold">{envAdminUsername}</code>
            </p>
            <p className="text-[10px] text-slate-400">
              Set via <code className="text-slate-600 dark:text-slate-300">VITE_ADMIN_USERNAME</code> and <code className="text-slate-600 dark:text-slate-300">VITE_ADMIN_PASSWORD</code> in <code className="text-slate-600 dark:text-slate-300">.env.example</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500 text-white font-bold">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              LoveLink Enterprise Admin Suite
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage templates visually, monitor live revenue in Rupees (₹), configure UPI / Cloudinary & control Legal CMS.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 flex items-center justify-center gap-1.5 self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" /> Log Out Admin
        </button>
      </div>


      {/* Admin Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Analytics Overview', icon: TrendingUp },
          { id: 'templates', label: 'Template Builder & Management', icon: Layers },
          { id: 'orders', label: 'Orders & Payments', icon: ShoppingBag },
          { id: 'payment', label: 'Payment & Cloudinary Config', icon: CreditCard },
          { id: 'email', label: 'Email Templates', icon: Mail },
          { id: 'coupons', label: 'Coupons & Promo Codes', icon: Tag },
          { id: 'legal', label: 'Legal CMS Manager', icon: FileText },
          { id: 'announcements', label: 'Announcement Bar', icon: Megaphone },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-2 transition-colors ${
                isActive
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mb-3">
                <IndianRupee className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Revenue</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{analytics?.totalRevenue.toFixed(2) || '0.00'}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Surprises Created</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics?.totalStories || 0}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Active Users</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics?.totalUsers || 0}
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Page Views</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {analytics?.totalViews || 0}
              </span>
            </div>
          </div>

          {/* Embedded Orders Summary */}
          <OrderManager />
        </div>
      )}

      {/* TAB 2: TEMPLATE BUILDER */}
      {activeTab === 'templates' && <TemplateManager />}

      {/* TAB 3: ORDERS */}
      {activeTab === 'orders' && <OrderManager />}

      {/* TAB 4: PAYMENT CONFIG */}
      {activeTab === 'payment' && <PaymentGatewayManager />}

      {/* TAB 5: EMAIL TEMPLATES */}
      {activeTab === 'email' && <EmailTemplateManager />}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && <CouponManager />}

      {/* TAB 7: LEGAL CMS */}
      {activeTab === 'legal' && <LegalCmsManager />}

      {/* TAB 8: ANNOUNCEMENT BAR */}
      {activeTab === 'announcements' && <AnnouncementManager />}
    </div>
  );
};
