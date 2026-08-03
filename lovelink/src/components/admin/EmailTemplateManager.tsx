import React, { useState, useEffect } from 'react';
import { Mail, Save, Eye, Code, Palette, RefreshCw, Check, X, Copy, Sparkles } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  variables: string[];
}

const DEFAULT_TEMPLATES: Record<string, EmailTemplate> = {
  purchaseConfirmation: {
    id: 'purchaseConfirmation',
    name: 'Purchase Confirmation',
    subject: '🎉 Thank You for Your Purchase - {{customerName}}!',
    variables: ['customerName', 'orderId', 'templateName', 'amount', 'orderDate', 'storyLink'],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purchase Confirmation - LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; }
    .content { padding: 30px 20px; }
    .content h2 { color: #667eea; margin-top: 0; }
    .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .order-details p { margin: 10px 0; }
    .order-details strong { color: #333; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 10px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">💝 LoveLink</div>
      <h1>🎉 Thank You for Your Purchase!</h1>
    </div>
    <div class="content">
      <h2>Hi {{customerName}},</h2>
      <p>Your <strong>{{templateName}}</strong> has been created successfully!</p>
      
      <div class="order-details">
        <p><strong>Order ID:</strong> {{orderId}}</p>
        <p><strong>Template:</strong> {{templateName}}</p>
        <p><strong>Amount Paid:</strong> ₹{{amount}}</p>
        <p><strong>Purchase Date:</strong> {{orderDate}}</p>
      </div>

      <p>Your personalized story is ready:</p>
      <center>
        <a href="{{storyLink}}" class="button">View Your Story</a>
      </center>

      <p>Thank you for choosing LoveLink!</p>
      <p>With love,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; 2026 LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
  paymentReceipt: {
    id: 'paymentReceipt',
    name: 'Payment Receipt',
    subject: '💳 Payment Receipt - Order {{orderId}}',
    variables: ['customerName', 'orderId', 'templateName', 'amount', 'paymentDate', 'paymentMethod', 'transactionId'],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .receipt-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size:36px;margin-bottom:10px;">💳</div>
      <h1>Payment Receipt</h1>
    </div>
    <div class="content">
      <h2>Dear {{customerName}},</h2>
      <p>Thank you for your payment. Here's your receipt:</p>
      
      <div class="receipt-details">
        <p><strong>Order ID:</strong> {{orderId}}</p>
        <p><strong>Transaction ID:</strong> {{transactionId}}</p>
        <p><strong>Amount Paid:</strong> ₹{{amount}}</p>
        <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
        <p><strong>Payment Date:</strong> {{paymentDate}}</p>
      </div>

      <p>Keep this receipt for your records.</p>
      <p>Best regards,<br><strong>LoveLink Finance Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: '👋 Welcome to LoveLink - {{customerName}}!',
    variables: ['customerName', 'loginEmail'],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LoveLink</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 10px; font-weight: bold; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size:36px;margin-bottom:10px;">💝</div>
      <h1>Welcome to LoveLink!</h1>
    </div>
    <div class="content">
      <h2>Hi {{customerName}},</h2>
      <p>We're thrilled to have you join the LoveLink family! 🎉</p>
      
      <p>With LoveLink, you can create beautiful, personalized stories to celebrate special moments with your loved ones.</p>
      
      <p>Your account has been created with email: <strong>{{loginEmail}}</strong></p>

      <center>
        <a href="{{APP_URL}}/templates" class="button">Explore Templates</a>
      </center>

      <p>Start creating your first story today!</p>
      <p>With love,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>Need help? <a href="mailto:support@lovelink.app">Contact Support</a></p>
      <p>&copy; 2026 LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
  systemNotification: {
    id: 'systemNotification',
    name: 'System Notification',
    subject: '🔔 {{notificationTitle}}',
    variables: ['customerName', 'notificationTitle', 'notificationMessage'],
    htmlContent: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>System Notification</title>
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: white; }
    .content { padding: 30px 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size:36px;margin-bottom:10px;">🔔</div>
      <h1>{{notificationTitle}}</h1>
    </div>
    <div class="content">
      <h2>Hi {{customerName}},</h2>
      <p>{{notificationMessage}}</p>
      
      <p>Best regards,<br><strong>The LoveLink Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2026 LoveLink. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
  },
};

export const EmailTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<Record<string, EmailTemplate>>(DEFAULT_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState<string>('purchaseConfirmation');
  const [editMode, setEditMode] = useState<'visual' | 'code'>('visual');
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Load saved templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lovelink_email_templates');
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved templates:', e);
      }
    }
  }, []);

  const currentTemplate = templates[activeTemplate];

  const handleSave = () => {
    setSaveStatus('saving');
    try {
      localStorage.setItem('lovelink_email_templates', JSON.stringify(templates));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset this template to default? This cannot be undone.')) {
      setTemplates((prev) => ({
        ...prev,
        [activeTemplate]: DEFAULT_TEMPLATES[activeTemplate],
      }));
    }
  };

  const handleCopyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
  };

  const getPreviewHTML = () => {
    let html = currentTemplate.htmlContent;
    // Replace variables with sample data
    const sampleData: Record<string, string> = {
      customerName: 'John Doe',
      orderId: 'ORD-123456',
      templateName: 'Romantic Story',
      amount: '499.00',
      orderDate: new Date().toLocaleDateString('en-IN'),
      paymentDate: new Date().toLocaleDateString('en-IN'),
      storyLink: 'https://lovelink.app/story/abc123',
      paymentMethod: 'UPI',
      transactionId: 'TXN-789012',
      loginEmail: 'john@example.com',
      notificationTitle: 'Important Update',
      notificationMessage: 'This is a sample notification message.',
      APP_URL: 'https://lovelink.app',
    };

    currentTemplate.variables.forEach((variable) => {
      const regex = new RegExp(`{{${variable}}}`, 'g');
      html = html.replace(regex, sampleData[variable] || `{{${variable}}}`);
    });

    return html;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-rose-500" />
            Email Template Manager
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize email templates sent to customers. Use variables like {'{{'} customerName {'}}'}  to personalize emails.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Default
          </button>

          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 ${
              saveStatus === 'saved'
                ? 'bg-green-500'
                : saveStatus === 'error'
                ? 'bg-red-500'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {saveStatus === 'saving' && <RefreshCw className="w-4 h-4 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'error' && <X className="w-4 h-4" />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Template Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Object.values(templates).map((template) => (
          <button
            key={template.id}
            onClick={() => setActiveTemplate(template.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              activeTemplate === template.id
                ? 'bg-rose-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Email Subject & Variables */}
        <div className="lg:col-span-1 space-y-4">
          {/* Subject */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              value={currentTemplate.subject}
              onChange={(e) =>
                setTemplates((prev) => ({
                  ...prev,
                  [activeTemplate]: { ...prev[activeTemplate], subject: e.target.value },
                }))
              }
              className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Available Variables */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Available Variables
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Click to copy variable to clipboard</p>
            <div className="space-y-2">
              {currentTemplate.variables.map((variable) => (
                <button
                  key={variable}
                  onClick={() => handleCopyVariable(variable)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between group"
                >
                  <span>{'{{' + variable + '}}'}</span>
                  <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Preview Button */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {/* Right: Code Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Edit Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode('visual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                editMode === 'visual'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Palette className="w-4 h-4" />
              Visual Editor
            </button>
            <button
              onClick={() => setEditMode('code')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                editMode === 'code'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Code className="w-4 h-4" />
              HTML Code
            </button>
          </div>

          {/* HTML Editor */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <textarea
              value={currentTemplate.htmlContent}
              onChange={(e) =>
                setTemplates((prev) => ({
                  ...prev,
                  [activeTemplate]: { ...prev[activeTemplate], htmlContent: e.target.value },
                }))
              }
              className="w-full h-[500px] px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              placeholder="Enter your HTML template here..."
            />
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <iframe
                    srcDoc={getPreviewHTML()}
                    className="w-full h-[600px] border-0"
                    title="Email Preview"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
