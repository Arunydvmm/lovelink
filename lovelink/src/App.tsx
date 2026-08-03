/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Template, Story, Order } from './types';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AnnouncementBar } from './components/common/AnnouncementBar';
import { HomePage } from './pages/HomePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { StoryPage } from './pages/StoryPage';
import { LegalPage } from './pages/LegalPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserDashboard } from './components/user/UserDashboard';
import { DynamicWizardBuilder } from './components/builder/DynamicWizardBuilder';
import { LivePreviewModal } from './components/builder/LivePreviewModal';
import { CheckoutModal } from './components/story/CheckoutModal';
import { QrModal } from './components/common/QrModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [routeParam, setRouteParam] = useState<string | undefined>(undefined);

  // Builder & Checkout Modals state
  const [selectedTemplateForBuilder, setSelectedTemplateForBuilder] = useState<Template | null>(null);
  const [builderInitialData, setBuilderInitialData] = useState<Record<string, any> | undefined>(undefined);

  const [previewModalData, setPreviewModalData] = useState<{
    template: Template;
    storyData: Record<string, any>;
  } | null>(null);

  const [checkoutModalData, setCheckoutModalData] = useState<{
    template: Template;
    storyData: Record<string, any>;
  } | null>(null);

  const [publishedQrStory, setPublishedQrStory] = useState<Story | null>(null);

  // Check initial URL hash (e.g. /#story/eternal-starry-proposal)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#story/')) {
        const slug = hash.replace('#story/', '');
        setCurrentTab('story');
        setRouteParam(slug);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setRouteParam(param);
    if (tab !== 'story') {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start Builder Wizard
  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplateForBuilder(template);
    setBuilderInitialData(undefined);
  };

  // Edit existing story
  const handleEditStory = (story: Story) => {
    setSelectedTemplateForBuilder(story.templateSnapshot);
    setBuilderInitialData(story.storyData);
  };

  // Proceed from Builder to Preview
  const handlePreviewFromBuilder = (formData: Record<string, any>) => {
    if (!selectedTemplateForBuilder) return;
    setPreviewModalData({
      template: selectedTemplateForBuilder,
      storyData: formData,
    });
  };

  // Proceed from Builder or Preview to Checkout
  const handleProceedToCheckout = (formData: Record<string, any>) => {
    if (!selectedTemplateForBuilder) return;
    setPreviewModalData(null);
    setCheckoutModalData({
      template: selectedTemplateForBuilder,
      storyData: formData,
    });
  };

  // Successful Checkout & Publish
  const handleCheckoutSuccess = (story: Story, order: Order) => {
    setCheckoutModalData(null);
    setSelectedTemplateForBuilder(null);
    setPublishedQrStory(story);
  };

  // Render main page content
  const renderContent = () => {
    // 1. If user is in the Dynamic Wizard Builder
    if (selectedTemplateForBuilder) {
      return (
        <DynamicWizardBuilder
          template={selectedTemplateForBuilder}
          initialData={builderInitialData}
          onPreview={handlePreviewFromBuilder}
          onProceedToCheckout={handleProceedToCheckout}
          onCancel={() => setSelectedTemplateForBuilder(null)}
        />
      );
    }

    // 2. Public Story View (`/#story/:slug`)
    if (currentTab === 'story' && routeParam) {
      return (
        <StoryPage
          storyIdOrSlug={routeParam}
          onNavigateHome={() => handleNavigate('home')}
        />
      );
    }

    // 3. Legal CMS Page
    if (currentTab === 'legal') {
      return (
        <LegalPage
          slug={routeParam || 'terms'}
          onNavigateHome={() => handleNavigate('home')}
        />
      );
    }

    // 4. Admin Dashboard
    if (currentTab === 'admin') {
      return <AdminDashboard />;
    }

    // 5. User Dashboard ("My Stories")
    if (currentTab === 'my-stories') {
      return (
        <UserDashboard
          onEditStory={handleEditStory}
          onViewStory={(slug) => handleNavigate('story', slug)}
          onCreateNew={() => handleNavigate('templates')}
        />
      );
    }

    // 6. Templates Catalogue
    if (currentTab === 'templates') {
      return (
        <TemplatesPage
          initialCategory={routeParam}
          onSelectTemplate={handleSelectTemplate}
        />
      );
    }

    // 7. Default: Home Page
    return (
      <HomePage
        onNavigate={handleNavigate}
        onSelectTemplate={handleSelectTemplate}
      />
    );
  };

  const isStoryPage = currentTab === 'story' && routeParam && !selectedTemplateForBuilder;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors">
      {/* Show Announcement Bar & Navbar unless viewing full story page */}
      {!isStoryPage && !selectedTemplateForBuilder && (
        <>
          <AnnouncementBar />
          <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
        </>
      )}

      {/* Main Content Area */}
      <div className="flex-1">{renderContent()}</div>

      {/* Footer unless viewing story page or in builder */}
      {!isStoryPage && !selectedTemplateForBuilder && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* MODALS */}

      {/* 1. Live Preview Modal */}
      {previewModalData && (
        <LivePreviewModal
          template={previewModalData.template}
          storyData={previewModalData.storyData}
          onClose={() => setPreviewModalData(null)}
          onProceedToCheckout={() => handleProceedToCheckout(previewModalData.storyData)}
        />
      )}

      {/* 2. Checkout Modal */}
      {checkoutModalData && (
        <CheckoutModal
          template={checkoutModalData.template}
          storyData={checkoutModalData.storyData}
          onClose={() => setCheckoutModalData(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* 3. QR Code Share Modal */}
      {publishedQrStory && (
        <QrModal
          story={publishedQrStory}
          onClose={() => {
            setPublishedQrStory(null);
            handleNavigate('my-stories');
          }}
          onViewStory={(slug) => {
            setPublishedQrStory(null);
            handleNavigate('story', slug);
          }}
        />
      )}
    </div>
  );
}
