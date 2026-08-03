import React, { useState } from 'react';
import { Template, EditableField } from '../../types';
import { CloudinaryUploader } from '../common/CloudinaryUploader';
import { ArrowLeft, ArrowRight, Eye, Sparkles, Upload, Plus, Trash2, CheckCircle2, Music, Image as ImageIcon } from 'lucide-react';

interface DynamicWizardBuilderProps {
  template: Template;
  initialData?: Record<string, any>;
  onPreview: (data: Record<string, any>) => void;
  onProceedToCheckout: (data: Record<string, any>) => void;
  onCancel: () => void;
}

export const DynamicWizardBuilder: React.FC<DynamicWizardBuilderProps> = ({
  template,
  initialData,
  onPreview,
  onProceedToCheckout,
  onCancel,
}) => {
  // Initialize story data with field defaults or initialData
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const defaults: Record<string, any> = {};
    template.fields.forEach((f) => {
      defaults[f.key] = initialData?.[f.key] !== undefined ? initialData[f.key] : f.defaultValue || '';
    });
    return { ...defaults, ...initialData };
  });

  // Group fields into wizard steps based on stepName
  const steps: string[] = Array.from(new Set(template.fields.map((f) => f.stepName || 'General Details')));
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const currentStepName = steps[currentStepIdx] || 'Details';
  const currentFields = template.fields.filter((f) => (f.stepName || 'General Details') === currentStepName);

  const handleFieldChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);
  };

  const handleNextStep = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    } else {
      // On final step, show preview first instead of going straight to checkout
      onPreview(formData);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-rose-100 dark:border-slate-800">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </button>

        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 dark:text-white">
            Creating: {template.name}
          </h2>
          <span className="text-xs text-rose-500 font-medium">Est. time: {template.estimatedTime}</span>
        </div>

        <button
          onClick={() => onPreview(formData)}
          className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 transition-colors flex items-center gap-1.5 border border-rose-200 dark:border-rose-800"
        >
          <Eye className="w-4 h-4" />
          Live Preview
        </button>
      </div>

      {/* Wizard Progress Steps Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
            Step {currentStepIdx + 1} of {steps.length}: {currentStepName}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            {Math.round(((currentStepIdx + 1) / steps.length) * 100)}% Completed
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-pink-600 transition-all duration-300 rounded-full"
            style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Dynamic Fields Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-100 dark:border-slate-800 space-y-6">
        {currentFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {field.label} {field.required && <span className="text-rose-500">*</span>}
            </label>

            {/* Field Type: Text */}
            {field.type === 'text' && (
              <input
                type="text"
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder || 'Enter text...'}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            )}

            {/* Field Type: Textarea */}
            {field.type === 'textarea' && (
              <textarea
                rows={4}
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder || 'Write your message...'}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white leading-relaxed"
              />
            )}

            {/* Field Type: Date */}
            {field.type === 'date' && (
              <input
                type="date"
                value={formData[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
              />
            )}

            {/* Field Type: Single Image Upload */}
            {(field.type === 'image_upload' || field.type === 'image') && (
              <CloudinaryUploader
                value={formData[field.key] || ''}
                onUploadSuccess={(url) => handleFieldChange(field.key, url)}
              />
            )}

            {/* Field Type: Gallery Upload (Array of image URLs) */}
            {field.type === 'gallery_upload' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(formData[field.key] || []).map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-200 shadow-sm">
                      <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(formData[field.key] || [])];
                          updated.splice(idx, 1);
                          handleFieldChange(field.key, updated);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <CloudinaryUploader
                  label="Add Image to Photo Gallery"
                  onUploadSuccess={(url) => {
                    handleFieldChange(field.key, [...(formData[field.key] || []), url]);
                  }}
                />
              </div>
            )}

            {/* Field Type: Timeline Items Builder */}
            {field.type === 'timeline_items' && (
              <div className="space-y-4">
                {(formData[field.key] || []).map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...(formData[field.key] || [])];
                        updated.splice(idx, 1);
                        handleFieldChange(field.key, updated);
                      }}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      Remove
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Date (e.g. 14 Feb 2023)"
                        value={item.date || ''}
                        onChange={(e) => {
                          const updated = [...(formData[field.key] || [])];
                          updated[idx] = { ...updated[idx], date: e.target.value };
                          handleFieldChange(field.key, updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Title (e.g. Our First Date)"
                        value={item.title || ''}
                        onChange={(e) => {
                          const updated = [...(formData[field.key] || [])];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          handleFieldChange(field.key, updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                      />
                    </div>
                    <textarea
                      placeholder="Short memory story..."
                      value={item.description || ''}
                      onChange={(e) => {
                        const updated = [...(formData[field.key] || [])];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        handleFieldChange(field.key, updated);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border text-xs"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const newItem = { date: 'Date', title: 'Special Memory', description: 'What made this moment unforgettable...' };
                    handleFieldChange(field.key, [...(formData[field.key] || []), newItem]);
                  }}
                  className="w-full py-2 rounded-xl border border-dashed border-rose-400 text-rose-500 text-xs font-bold hover:bg-rose-50"
                >
                  + Add Timeline Event
                </button>
              </div>
            )}

            {field.helpText && <p className="text-[11px] text-slate-400">{field.helpText}</p>}
          </div>
        ))}

        {/* Wizard Controls */}
        <div className="pt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={currentStepIdx === 0}
            onClick={handlePrevStep}
            className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs disabled:opacity-40 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
          >
            {currentStepIdx === steps.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Preview & Continue to Checkout
              </>
            ) : (
              <>
                Next Step <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
