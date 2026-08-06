import React, { useState, useEffect } from 'react';
import { Template } from '../../types';
import { store } from '../../lib/store';
import { VisualTemplateEditor } from './VisualTemplateEditor';
import { Plus, Edit3, Trash2, Copy, Sparkles, Tag, CheckCircle2 } from 'lucide-react';

export const TemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<Template | null | 'new'>(null);

  const fetchTemplates = () => {
    store.getTemplates().then(setTemplates);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (template: Template) => {
    await store.saveTemplate(template);
    setEditingTemplate(null);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await store.deleteTemplate(id);
      fetchTemplates();
    }
  };

  const handleClone = async (template: Template) => {
    const clone: Template = {
      ...template,
      id: 'tmpl_' + Math.random().toString(36).substr(2, 9),
      name: `${template.name} (Copy)`,
      slug: `${template.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await store.saveTemplate(clone);
    fetchTemplates();
  };

  if (editingTemplate !== null) {
    return (
      <VisualTemplateEditor
        initialTemplate={editingTemplate === 'new' ? null : editingTemplate}
        onSave={handleSave}
        onCancel={() => setEditingTemplate(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Template Management</h3>
          <p className="text-xs text-slate-500">Create, edit, clone or archive surprise templates</p>
        </div>

        <button
          onClick={() => setEditingTemplate('new')}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Create New Template (Visual Editor)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img src={tmpl.coverImage} alt={tmpl.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {tmpl.category}
                </span>
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
                  {tmpl.price === 0 ? 'FREE' : `₹${tmpl.price}`}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{tmpl.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{tmpl.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => setEditingTemplate(tmpl)}
                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1 hover:bg-rose-100"
              >
                <Edit3 className="w-3.5 h-3.5" /> Visual Edit
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleClone(tmpl)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                  title="Clone Template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tmpl.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
