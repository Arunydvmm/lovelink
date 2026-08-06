import React, { useState, useEffect } from 'react';
import { Story } from '../../types';
import { store } from '../../lib/store';
import { QrModal } from '../common/QrModal';
import { LayoutDashboard, Eye, Share2, Edit3, Trash2, Copy, Sparkles, ExternalLink, QrCode, AlertTriangle, X } from 'lucide-react';

interface UserDashboardProps {
  onEditStory: (story: Story) => void;
  onViewStory: (slug: string) => void;
  onCreateNew: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onEditStory,
  onViewStory,
  onCreateNew,
}) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedQrStory, setSelectedQrStory] = useState<Story | null>(null);
  const [deleteConfirmStoryId, setDeleteConfirmStoryId] = useState<string | null>(null);

  const fetchStories = () => {
    store.getStories().then(setStories);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id: string) => {
    await store.deleteStory(id);
    fetchStories();
    setDeleteConfirmStoryId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Dashboard Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-rose-500" /> My Digital Surprises
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your created surprise pages, view analytics & edit content anytime for free.
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" /> Create New Surprise
        </button>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-20 bg-rose-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-rose-200 dark:border-slate-800 max-w-xl mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-2xl">
            💌
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Surprises Created Yet</h3>
          <p className="text-xs text-slate-500 mb-6">
            Pick a romantic template and create an unforgettable digital surprise page in under 5 minutes.
          </p>
          <button
            onClick={onCreateNew}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-transform"
          >
            Browse Surprise Templates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-[10px] uppercase tracking-wider">
                    {s.templateSnapshot?.name || 'Surprise Page'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-rose-500" /> {s.views || 0} Views
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  To: {s.recipientName}
                </h3>
                <p className="text-xs text-slate-500">From: {s.senderName}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
                {window.location.origin}/#story/{s.slug || s.id}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => onViewStory(s.slug || s.id)}
                  className="py-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-rose-500 font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Live
                </button>
                <button
                  onClick={() => setSelectedQrStory(s)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border"
                >
                  <QrCode className="w-3.5 h-3.5 text-rose-500" /> Share QR
                </button>
                <button
                  onClick={() => onEditStory(s)}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Content
                </button>
                <button
                  onClick={() => setDeleteConfirmStoryId(s.id)}
                  className="py-2 px-3 rounded-xl bg-red-50 text-red-600 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrStory && (
        <QrModal
          story={selectedQrStory}
          onClose={() => setSelectedQrStory(null)}
          onViewStory={onViewStory}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStoryId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Surprise?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this surprise page? All associated data will be removed.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmStoryId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmStoryId)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
