import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './firebase/authContext';
import { SettingsProvider, useSettings } from './firebase/settingsContext';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HostingPlans } from './components/HostingPlans';
import { Features } from './components/Features';
import { WhyChooseUs } from './components/WhyChooseUs';
import { FaqSection } from './components/FaqSection';
import { ReviewsSection } from './components/ReviewsSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminPanel } from './components/admin/AdminPanel';
import { LoadingScreen } from './components/LoadingScreen';

export type AppView = 'home' | 'plans' | 'dashboard' | 'admin';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [accessDeniedNotice, setAccessDeniedNotice] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<
    'overview' | 'profile' | 'orders' | 'notifications' | 'support' | 'discord' | 'settings'
  >('overview');
  const [highlightTicketId, setHighlightTicketId] = useState<string | null>(null);
  const { user, isAdmin, openAuthModal } = useAuth();
  const { websiteSettings } = useSettings();

  const handleOpenSupportTicket = (ticketId?: string) => {
    setDashboardTab('support');
    if (ticketId) {
      setHighlightTicketId(ticketId);
    }
    setCurrentView('dashboard');
  };

  // Update document title dynamically
  useEffect(() => {
    if (websiteSettings.browserTitle) {
      document.title = websiteSettings.browserTitle;
    } else if (websiteSettings.websiteName) {
      document.title = `${websiteSettings.websiteName} | High-Performance Minecraft Server Hosting`;
    }
  }, [websiteSettings]);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Route protection for dashboard & admin
  const handleNavigate = (view: AppView) => {
    setAccessDeniedNotice(null);
    if (view === 'dashboard' && !user) {
      openAuthModal('login');
      return;
    }
    if (view === 'admin' && !isAdmin) {
      if (!user) {
        openAuthModal('login');
      } else {
        setAccessDeniedNotice(
          'Your account is not registered with administrative access privileges. Please contact an owner to request access.'
        );
      }
      return;
    }
    setCurrentView(view);
  };

  // Render view content
  let viewContent: React.ReactNode = null;

  if (currentView === 'admin' && isAdmin) {
    viewContent = (
      <div className="min-h-screen bg-slate-950">
        <AdminPanel onExitToWebsite={() => setCurrentView('home')} />
        <AuthModal />
      </div>
    );
  } else if (currentView === 'dashboard' && user) {
    viewContent = (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
        <div>
          <AnnouncementBar onNavigateToPlans={() => setCurrentView('plans')} />
          <Navbar
            currentView={currentView}
            setCurrentView={handleNavigate}
            onOpenSupportTicket={handleOpenSupportTicket}
          />
          <UserDashboard
            onBackToStorefront={() => setCurrentView('home')}
            onExplorePlans={() => setCurrentView('plans')}
            initialTab={dashboardTab}
            highlightTicketId={highlightTicketId}
          />
        </div>
        <Footer setCurrentView={handleNavigate} />
        <AuthModal />
      </div>
    );
  } else {
    viewContent = (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
        <div>
          <AnnouncementBar onNavigateToPlans={() => setCurrentView('plans')} />
          <Navbar
            currentView={currentView}
            setCurrentView={handleNavigate}
            onOpenSupportTicket={handleOpenSupportTicket}
          />

          {accessDeniedNotice && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center justify-between gap-3">
                <span>{accessDeniedNotice}</span>
                <button
                  onClick={() => setAccessDeniedNotice(null)}
                  className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* HOME VIEW */}
          {currentView === 'home' && (
            <main>
              <Hero onExplorePlans={() => setCurrentView('plans')} />
              <HostingPlans />
              <Features />
              <WhyChooseUs />
              <ReviewsSection />
              <FaqSection />
            </main>
          )}

          {/* PLANS VIEW (Dedicated Catalog Page) */}
          {currentView === 'plans' && (
            <main className="pt-8 pb-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                <button
                  onClick={() => setCurrentView('home')}
                  className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1 mb-4"
                >
                  ← Return to Overview
                </button>
              </div>
              <HostingPlans showAllHeader={true} />
              <WhyChooseUs />
              <FaqSection />
            </main>
          )}
        </div>

        <Footer setCurrentView={handleNavigate} />
        <AuthModal />
      </div>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {isInitialLoading && (
          <motion.div
            key="app-loading-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 pointer-events-auto"
          >
            <LoadingScreen onFinish={() => setIsInitialLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {viewContent}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <MainAppContent />
      </SettingsProvider>
    </AuthProvider>
  );
}
