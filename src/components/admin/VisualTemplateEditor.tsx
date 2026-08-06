import React, { useState } from 'react';
import { Template, DynamicSection, GenericComponent, EditableField, ComponentType, CategoryId } from '../../types';
import { INITIAL_CATEGORIES } from '../../data/initialDb';
import { CloudinaryUploader } from '../common/CloudinaryUploader';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Eye, Sparkles, Music, Layers, Palette, FileText } from 'lucide-react';

interface VisualTemplateEditorProps {
  initialTemplate?: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export const VisualTemplateEditor: React.FC<VisualTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  onCancel,
}) => {
  const [template, setTemplate] = useState<Template>(() => {
    if (initialTemplate) return JSON.parse(JSON.stringify(initialTemplate));
    return {
      id: 'tmpl_' + Math.random().toString(36).substr(2, 9),
      name: 'New Custom Romantic Template',
      slug: 'new-custom-romantic-' + Math.random().toString(36).substr(2, 6),
      category: 'proposal',
      coverImage: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
      previewImages: ['https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80'],
      price: 0, // Integer value in INR (0 = free)
      salePrice: undefined, // Integer value only when on sale
      description: 'A beautiful visual template built with LoveLink Visual Template Editor.',
      estimatedTime: '3 mins',
      isFeatured: true,
      isTrending: true,
      isPremium: true,
      status: 'published',
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      theme: {
        primaryColor: '#e11d48',
        secondaryColor: '#f43f5e',
        backgroundColor: '#0f172a',
        textColor: '#ffffff',
        fontFamily: 'Playfair Display',
        particleType: 'hearts',
        heartFloating: true,
      },
      music: {
        url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=romantic-piano-112239.mp3',
        title: 'A Thousand Years (Piano)',
        autoplay: true,
      },
      sections: [
        {
          id: 'sec_1',
          title: 'A Love Story',
          backgroundStyle: 'dark_romantic',
          components: [
            { id: 'c1', type: 'heading', props: { title: 'Dear {{recipientName}}', subtitle: 'With love from {{senderName}}', align: 'center' } },
            { id: 'c2', type: 'text', props: { content: '{{mainMessage}}', align: 'center' } },
          ],
        },
      ],
      fields: [
        { id: 'f1', key: 'senderName', label: 'Your Name', type: 'text', stepName: 'Basic Details', defaultValue: 'Alex' },
        { id: 'f2', key: 'recipientName', label: 'Recipient Name', type: 'text', stepName: 'Basic Details', defaultValue: 'Sophia' },
        { id: 'f3', key: 'mainMessage', label: 'Heartfelt Message', type: 'textarea', stepName: 'Message', defaultValue: 'You make every day brighter...' },
      ],
      defaultContent: {},
    };
  });

  const [activeTab, setActiveTab] = useState<'meta' | 'theme' | 'sections' | 'fields'>('sections');

  // --- SECTION BUILDER HELPERS ---
  const handleAddSection = () => {
    const newSec: DynamicSection = {
      id: 'sec_' + Math.random().toString(36).substr(2, 6),
      title: 'New Surprise Section',
      backgroundStyle: 'gradient',
      components: [
        {
          id: 'cmp_' + Math.random().toString(36).substr(2, 6),
          type: 'heading',
          props: { title: 'Special Moment', subtitle: 'Subtitle text', align: 'center' },
        },
      ],
    };
    setTemplate({ ...template, sections: [...template.sections, newSec] });
  };

  const handleRemoveSection = (secIdx: number) => {
    const updated = [...template.sections];
    updated.splice(secIdx, 1);
    setTemplate({ ...template, sections: updated });
  };

  const handleAddComponentToSection = (secIdx: number, type: ComponentType) => {
    const updated = [...template.sections];
    const newComp: GenericComponent = {
      id: 'cmp_' + Math.random().toString(36).substr(2, 6),
      type,
      props:
        type === 'heading'
          ? { title: 'Heading Title', subtitle: 'Subtitle', align: 'center' }
          : type === 'text'
          ? { content: 'Your message content here...' }
          : type === 'gift_box'
          ? { coverText: 'Tap To Unwrap Gift 🎁', giftMessage: 'Surprise Gift Message!' }
          : type === 'scratch_card'
          ? { coverText: 'Scratch Here 🪙', hiddenMessage: 'Secret Coupon Code!' }
          : type === 'interactive_question'
          ? { question: 'Will You Be My Valentine?', yesButtonText: 'YES! ❤️', noButtonText: 'No 😜' }
          : type === 'certificate'
          ? { title: 'Certificate of Eternal Love', recipientKey: 'recipientName', senderKey: 'senderName' }
          : { label: 'Interactive Element' },
    };
    updated[secIdx].components.push(newComp);
    setTemplate({ ...template, sections: updated });
  };

  const handleRemoveComponent = (secIdx: number, compIdx: number) => {
    const updated = [...template.sections];
    updated[secIdx].components.splice(compIdx, 1);
    setTemplate({ ...template, sections: updated });
  };

  // --- FIELD BUILDER HELPERS ---
  const handleAddField = () => {
    const newField: EditableField = {
      id: 'f_' + Math.random().toString(36).substr(2, 6),
      key: 'customField_' + Math.floor(Math.random() * 100),
      label: 'New Question Field',
      type: 'text',
      stepName: 'Details',
      defaultValue: 'Sample Answer',
    };
    setTemplate({ ...template, fields: [...template.fields, newField] });
  };

  const handleRemoveField = (fieldIdx: number) => {
    const updated = [...template.fields];
    updated.splice(fieldIdx, 1);
    setTemplate({ ...template, fields: updated });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-rose-100 dark:border-slate-800 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-rose-500" />
            Visual Template Editor & JSON Generator
          </h2>
          <p className="text-xs text-slate-500">
            Visually design dynamic component sections, colors & wizard fields. System generates JSON on Save.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(template)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" /> Save & Compile JSON
          </button>
        </div>
      </div>

      {/* Editor Sub-Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'sections'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Sections & Components ({template.sections.length})
        </button>
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'fields'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Dynamic Wizard Fields ({template.fields.length})
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'theme'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" /> Theme & Music
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 ${
            activeTab === 'meta'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Pricing & Meta
        </button>
      </div>

      {/* TAB 1: SECTIONS & GENERIC COMPONENTS */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {template.sections.map((sec, secIdx) => (
            <div
              key={sec.id || secIdx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                    {secIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={sec.title || ''}
                    onChange={(e) => {
                      const updated = [...template.sections];
                      updated[secIdx].title = e.target.value;
                      setTemplate({ ...template, sections: updated });
                    }}
                    placeholder="Section Title..."
                    className="font-bold text-sm bg-transparent border-b border-dashed border-slate-300 outline-none"
                  />
                  <select
                    value={sec.backgroundStyle || 'gradient'}
                    onChange={(e) => {
                      const updated = [...template.sections];
                      updated[secIdx].backgroundStyle = e.target.value as any;
                      setTemplate({ ...template, sections: updated });
                    }}
                    className="text-xs p-1 rounded border bg-white dark:bg-slate-800"
                  >
                    <option value="solid">Solid Background</option>
                    <option value="gradient">Gradient Background</option>
                    <option value="glass">Glassmorphism</option>
                    <option value="dark_romantic">Dark Romantic</option>
                    <option value="sunset">Sunset Glow</option>
                    <option value="hearts">Ambient Hearts</option>
                  </select>
                </div>

                <button
                  onClick={() => handleRemoveSection(secIdx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Components inside Section */}
              <div className="space-y-3 pl-4 border-l-2 border-rose-300 dark:border-rose-800">
                {sec.components.map((comp, compIdx) => (
                  <div
                    key={comp.id || compIdx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold uppercase tracking-wider text-rose-500 mr-2">
                        [{comp.type}]
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {comp.props.title || comp.props.content || comp.props.question || comp.props.coverText || 'Generic Component'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleRemoveComponent(secIdx, compIdx)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Generic Component Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">+ Add Component:</span>
                  {(['heading', 'text', 'gallery', 'timeline', 'countdown', 'gift_box', 'scratch_card', 'interactive_question', 'certificate', 'confetti'] as ComponentType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleAddComponentToSection(secIdx, t)}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 font-bold text-[10px] hover:bg-rose-100"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddSection}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 text-rose-500 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            + Add New Dynamic Section
          </button>
        </div>
      )}

      {/* TAB 2: DYNAMIC WIZARD FIELDS */}
      {activeTab === 'fields' && (
        <div className="space-y-4">
          {template.fields.map((field, fieldIdx) => (
            <div
              key={field.id || fieldIdx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
            >
              <div>
                <label className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Field Label</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const updated = [...template.fields];
                    updated[fieldIdx].label = e.target.value;
                    setTemplate({ ...template, fields: updated });
                  }}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Replacement Key</label>
                <input
                  type="text"
                  value={field.key}
                  onChange={(e) => {
                    const updated = [...template.fields];
                    updated[fieldIdx].key = e.target.value;
                    setTemplate({ ...template, fields: updated });
                  }}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[10px] uppercase text-slate-400 block mb-1">Field Type</label>
                <select
                  value={field.type}
                  onChange={(e) => {
                    const updated = [...template.fields];
                    updated[fieldIdx].type = e.target.value as any;
                    setTemplate({ ...template, fields: updated });
                  }}
                  className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
                >
                  <option value="text">Text Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="date">Date Picker</option>
                  <option value="gallery_upload">Gallery Photo Upload</option>
                  <option value="timeline_items">Timeline Events Builder</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <input
                  type="text"
                  placeholder="Step Name (e.g. Details)"
                  value={field.stepName}
                  onChange={(e) => {
                    const updated = [...template.fields];
                    updated[fieldIdx].stepName = e.target.value;
                    setTemplate({ ...template, fields: updated });
                  }}
                  className="p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs w-3/4"
                />
                <button
                  onClick={() => handleRemoveField(fieldIdx)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddField}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-rose-300 dark:border-rose-800 text-rose-500 font-bold text-xs hover:bg-rose-50"
          >
            + Add Dynamic Form Field
          </button>
        </div>
      )}

      {/* TAB 3: THEME & MUSIC */}
      {activeTab === 'theme' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Primary Color</label>
            <input
              type="color"
              value={template.theme.primaryColor}
              onChange={(e) => setTemplate({ ...template, theme: { ...template.theme, primaryColor: e.target.value } })}
              className="w-full h-10 rounded-xl cursor-pointer"
            />
          </div>
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Font Family</label>
            <select
              value={template.theme.fontFamily}
              onChange={(e) => setTemplate({ ...template, theme: { ...template.theme, fontFamily: e.target.value } })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"
            >
              <option value="Playfair Display">Playfair Display (Romantic Serif)</option>
              <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Sans)</option>
              <option value="Dancing Script">Dancing Script (Handwritten)</option>
              <option value="Cinzel">Cinzel (Royal Elegance)</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="font-bold uppercase text-slate-400 block mb-1">Background Music Audio URL</label>
            <input
              type="text"
              value={template.music?.url || ''}
              onChange={(e) => setTemplate({ ...template, music: { ...(template.music || { title: 'Music' }), url: e.target.value } })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono"
            />
          </div>
        </div>
      )}

      {/* TAB 4: PRICING & META */}
      {activeTab === 'meta' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate({ ...template, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Category</label>
            <select
              value={template.category}
              onChange={(e) => setTemplate({ ...template, category: e.target.value as CategoryId })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"
            >
              {INITIAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Price (INR ₹) - 0 for Free - Integer values only</label>
            <input
              type="number"
              step="1"
              min="0"
              value={template.price}
              onChange={(e) => setTemplate({ ...template, price: Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono font-bold"
            />
          </div>
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Sale Price (INR ₹) - Leave blank if no sale</label>
            <input
              type="number"
              step="1"
              min="0"
              value={template.salePrice || ''}
              onChange={(e) => setTemplate({ ...template, salePrice: e.target.value ? Math.max(0, Math.floor(parseFloat(e.target.value) || 0)) : undefined })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900 font-mono font-bold"
            />
          </div>
          <div>
            <label className="font-bold uppercase text-slate-400 block mb-1">Estimated Completion Time</label>
            <input
              type="text"
              value={template.estimatedTime || '3 mins'}
              onChange={(e) => setTemplate({ ...template, estimatedTime: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="font-bold uppercase text-slate-400 block mb-1">Template Description</label>
            <textarea
              rows={2}
              value={template.description || ''}
              onChange={(e) => setTemplate({ ...template, description: e.target.value })}
              className="w-full p-2.5 rounded-xl border bg-white dark:bg-slate-900"
            />
          </div>

          <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <CloudinaryUploader
              label="1. Main Cover Image / Card Thumbnail (Upload via Cloudinary)"
              value={template.coverImage}
              onUploadSuccess={(url) => setTemplate({ ...template, coverImage: url })}
            />
          </div>

          <div className="sm:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              2. Template Preview Screenshots / Gallery Images ({template.previewImages?.length || 0} Images)
            </label>
            
            {/* Grid of existing preview images */}
            {template.previewImages && template.previewImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {template.previewImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-200 shadow-sm bg-slate-950">
                    <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(template.previewImages || [])];
                        updated.splice(idx, 1);
                        setTemplate({ ...template, previewImages: updated });
                      }}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-md"
                      title="Delete Preview Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <CloudinaryUploader
              label="Upload New Preview Image to Template Gallery (Cloudinary)"
              onUploadSuccess={(url) => {
                const current = template.previewImages || [];
                setTemplate({ ...template, previewImages: [...current, url] });
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
