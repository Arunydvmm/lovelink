import React, { useState } from 'react';
import { Heart, Sparkles, LayoutDashboard, Shield, Menu, X, PlusCircle } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'templates', label: 'Browse Templates' },
    { id: 'my-stories', label: 'My Stories', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-rose-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-red-500 bg-clip-text text-transparent font-display tracking-tight">
                LoveLink
              </span>
              <span className="block text-[10px] font-semibold tracking-wider uppercase text-rose-500 -mt-1">
                Surprise Builder
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => handleNavClick('templates')}
              aria-label="Create new surprise"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold text-sm shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Create Surprise
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-medium flex items-center gap-3 transition-colors ${
                    isActive
                      ? 'bg-rose-500 text-white font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2">
              <button
                onClick={() => handleNavClick('templates')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-center shadow-md flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" aria-hidden="true" />
                Create New Surprise
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-rose-100 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleNavClick('home')}
          aria-label="Go to home page"
          aria-current={currentTab === 'home' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-xs font-medium px-3 py-1 rounded-xl ${
            currentTab === 'home' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5" aria-hidden="true" />
          <span>Home</span>
        </button>
        <button
          onClick={() => handleNavClick('templates')}
          aria-label="Browse templates"
          aria-current={currentTab === 'templates' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-xs font-medium px-3 py-1 rounded-xl ${
            currentTab === 'templates' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Sparkles className="w-5 h-5" aria-hidden="true" />
          <span>Templates</span>
        </button>
        <button
          onClick={() => handleNavClick('my-stories')}
          aria-label="View my stories"
          aria-current={currentTab === 'my-stories' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-xs font-medium px-3 py-1 rounded-xl ${
            currentTab === 'my-stories' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
          <span>My Stories</span>
        </button>
        <button
          onClick={() => handleNavClick('admin')}
          aria-label="Admin panel"
          aria-current={currentTab === 'admin' ? 'page' : undefined}
          className={`flex flex-col items-center gap-1 text-xs font-medium px-3 py-1 rounded-xl ${
            currentTab === 'admin' ? 'text-rose-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="w-5 h-5" aria-hidden="true" />
          <span>Admin</span>
        </button>
      </div>
    </>
  );
};
