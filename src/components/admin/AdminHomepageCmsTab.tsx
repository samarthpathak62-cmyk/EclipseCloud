import React, { useEffect, useState } from 'react';
import {
  Home,
  Megaphone,
  Sparkles,
  HelpCircle,
  Star,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useSettings } from '../../firebase/settingsContext';
import { useAuth } from '../../firebase/authContext';
import {
  fetchAnnouncements,
  saveAnnouncement,
  deleteAnnouncementDoc,
  fetchFeatures,
  saveFeature,
  deleteFeatureDoc,
  fetchFaqs,
  saveFaq,
  deleteFaqDoc,
  fetchReviews,
  saveReview,
  deleteReviewDoc,
} from '../../firebase/firestoreService';
import {
  Announcement,
  FeatureItem,
  FaqItem,
  ReviewItem,
} from '../../types';

export const AdminHomepageCmsTab: React.FC = () => {
  const { homepageConfig, updateHomepageConfig } = useSettings();
  const { user } = useAuth();

  const [cmsSubTab, setCmsSubTab] = useState<'hero' | 'announcements' | 'features' | 'faq' | 'reviews'>('hero');

  // Hero form state
  const [heroHeading, setHeroHeading] = useState(homepageConfig.heroHeading || '');
  const [heroSubheading, setHeroSubheading] = useState(homepageConfig.heroSubheading || '');
  const [heroDescription, setHeroDescription] = useState(homepageConfig.heroDescription || '');
  const [heroCtaText, setHeroCtaText] = useState(homepageConfig.heroCtaText || 'View Server Plans');
  const [heroDiscordText, setHeroDiscordText] = useState(homepageConfig.heroDiscordText || 'Order on Discord');
  const [heroVisible, setHeroVisible] = useState(homepageConfig.heroVisible ?? true);

  const [whyTitle, setWhyTitle] = useState(homepageConfig.whyChooseUsTitle || '');
  const [whyDesc, setWhyDesc] = useState(homepageConfig.whyChooseUsDescription || '');

  const [heroSaving, setHeroSaving] = useState(false);
  const [heroSuccess, setHeroSuccess] = useState(false);

  useEffect(() => {
    setHeroHeading(homepageConfig.heroHeading || '');
    setHeroSubheading(homepageConfig.heroSubheading || '');
    setHeroDescription(homepageConfig.heroDescription || '');
    setHeroCtaText(homepageConfig.heroCtaText || 'View Server Plans');
    setHeroDiscordText(homepageConfig.heroDiscordText || 'Order on Discord');
    setHeroVisible(homepageConfig.heroVisible ?? true);
    setWhyTitle(homepageConfig.whyChooseUsTitle || '');
    setWhyDesc(homepageConfig.whyChooseUsDescription || '');
  }, [homepageConfig]);

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnounce, setEditingAnnounce] = useState<Announcement | null>(null);
  const [announceModal, setAnnounceModal] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  const [announceLink, setAnnounceLink] = useState('');
  const [announceActive, setAnnounceActive] = useState(true);

  // Features State
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [featModal, setFeatModal] = useState(false);
  const [editingFeat, setEditingFeat] = useState<FeatureItem | null>(null);
  const [featTitle, setFeatTitle] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featIcon, setFeatIcon] = useState('Cpu');
  const [featBadge, setFeatBadge] = useState('');
  const [featActive, setFeatActive] = useState(true);

  // FAQ State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [faqModal, setFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('General');
  const [faqActive, setFaqActive] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewModal, setReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [revAuthor, setRevAuthor] = useState('');
  const [revRole, setRevRole] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [revVerified, setRevVerified] = useState(true);
  const [revActive, setRevActive] = useState(true);

  const [loading, setLoading] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);

  const loadAllCms = async () => {
    setLoading(true);
    try {
      const [aList, fList, qList, rList] = await Promise.all([
        fetchAnnouncements(),
        fetchFeatures(),
        fetchFaqs(),
        fetchReviews(),
      ]);
      setAnnouncements(Array.isArray(aList) ? aList : (aList && typeof aList === 'object' ? Object.values(aList) : []));
      setFeatures(Array.isArray(fList) ? fList : (fList && typeof fList === 'object' ? Object.values(fList) : []));
      setFaqs(Array.isArray(qList) ? qList : (qList && typeof qList === 'object' ? Object.values(qList) : []));
      setReviews(Array.isArray(rList) ? rList : (rList && typeof rList === 'object' ? Object.values(rList) : []));
    } catch (e) {
      console.warn('Error loading CMS data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllCms();
  }, []);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    setHeroSaving(true);
    try {
      await updateHomepageConfig({
        ...homepageConfig,
        heroHeading,
        heroSubheading,
        heroDescription,
        heroCtaText,
        heroDiscordText,
        heroVisible,
        whyChooseUsTitle: whyTitle,
        whyChooseUsDescription: whyDesc,
      });
      setHeroSuccess(true);
      setTimeout(() => setHeroSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving hero config:', err);
    } finally {
      setHeroSaving(false);
    }
  };

  // Announcement Handlers
  const openAnnounceCreate = () => {
    setEditingAnnounce(null);
    setAnnounceText('');
    setAnnounceLink('');
    setAnnounceActive(true);
    setAnnounceModal(true);
  };
  const openAnnounceEdit = (a: Announcement) => {
    setEditingAnnounce(a);
    setAnnounceText(a.text);
    setAnnounceLink(a.linkUrl || '');
    setAnnounceActive(a.active);
    setAnnounceModal(true);
  };
  const handleSaveAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAnnouncement({
      id: editingAnnounce?.id || `ann-${Date.now()}`,
      text: announceText.trim(),
      linkUrl: announceLink.trim() || undefined,
      active: announceActive,
      displayOrder: 1,
    }, user?.email || 'Admin');
    setAnnounceModal(false);
    await loadAllCms();
  };

  // Feature Handlers
  const openFeatCreate = () => {
    setEditingFeat(null);
    setFeatTitle('');
    setFeatDesc('');
    setFeatIcon('Cpu');
    setFeatBadge('');
    setFeatActive(true);
    setFeatModal(true);
  };
  const openFeatEdit = (f: FeatureItem) => {
    setEditingFeat(f);
    setFeatTitle(f.title);
    setFeatDesc(f.description);
    setFeatIcon(f.icon);
    setFeatBadge(f.badge || '');
    setFeatActive(f.active);
    setFeatModal(true);
  };
  const handleSaveFeat = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFeature({
      id: editingFeat?.id || `feat-${Date.now()}`,
      title: featTitle.trim(),
      description: featDesc.trim(),
      icon: featIcon,
      badge: featBadge.trim() || undefined,
      displayOrder: 1,
      active: featActive,
    }, user?.email || 'Admin');
    setFeatModal(false);
    await loadAllCms();
  };

  // FAQ Handlers
  const openFaqCreate = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('General');
    setFaqActive(true);
    setFaqModal(true);
  };
  const openFaqEdit = (q: FaqItem) => {
    setEditingFaq(q);
    setFaqQuestion(q.question);
    setFaqAnswer(q.answer);
    setFaqCategory(q.category || 'General');
    setFaqActive(q.active);
    setFaqModal(true);
  };
  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveFaq({
      id: editingFaq?.id || `faq-${Date.now()}`,
      question: faqQuestion.trim(),
      answer: faqAnswer.trim(),
      category: faqCategory,
      displayOrder: 1,
      active: faqActive,
    }, user?.email || 'Admin');
    setFaqModal(false);
    await loadAllCms();
  };

  // Reviews Handlers
  const openReviewCreate = () => {
    setEditingReview(null);
    setRevAuthor('');
    setRevRole('SMP Server Owner');
    setRevRating(5);
    setRevText('');
    setRevVerified(true);
    setRevActive(true);
    setReviewModal(true);
  };
  const openReviewEdit = (r: ReviewItem) => {
    setEditingReview(r);
    setRevAuthor(r.authorName);
    setRevRole(r.authorRole);
    setRevRating(r.rating);
    setRevText(r.reviewText);
    setRevVerified(r.verified);
    setRevActive(r.active);
    setReviewModal(true);
  };
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveReview({
      id: editingReview?.id || `rev-${Date.now()}`,
      authorName: revAuthor.trim(),
      authorRole: revRole.trim(),
      rating: Number(revRating) || 5,
      reviewText: revText.trim(),
      verified: revVerified,
      active: revActive,
      displayOrder: 1,
    }, user?.email || 'Admin');
    setReviewModal(false);
    await loadAllCms();
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'announcement') {
      await deleteAnnouncementDoc(deleteTarget.id, user?.email || 'Admin');
    } else if (deleteTarget.type === 'feature') {
      await deleteFeatureDoc(deleteTarget.id, user?.email || 'Admin');
    } else if (deleteTarget.type === 'faq') {
      await deleteFaqDoc(deleteTarget.id, user?.email || 'Admin');
    } else if (deleteTarget.type === 'review') {
      await deleteReviewDoc(deleteTarget.id, user?.email || 'Admin');
    }
    setDeleteTarget(null);
    await loadAllCms();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Homepage CMS Content Manager</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Control every dynamic section of the homepage: Hero typography, announcements, hardware features, FAQ items, and player reviews.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'hero', label: 'Hero & Why Choose Us', icon: Home },
          { id: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
          { id: 'features', label: `Features (${features.length})`, icon: Sparkles },
          { id: 'faq', label: `FAQ Items (${faqs.length})`, icon: HelpCircle },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = cmsSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCmsSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. HERO TAB */}
      {cmsSubTab === 'hero' && (
        <form onSubmit={handleSaveHero} className="space-y-6 text-xs max-w-4xl">
          {heroSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Hero & comparison text saved and published!</span>
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Hero Section Typography & CTAs
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hero Main Heading</label>
              <input
                type="text"
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hero Gradient Subheading</label>
              <input
                type="text"
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Hero Description Paragraph</label>
              <textarea
                rows={3}
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Plans CTA Button Text</label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={(e) => setHeroCtaText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Discord Secondary Button Text</label>
                <input
                  type="text"
                  value={heroDiscordText}
                  onChange={(e) => setHeroDiscordText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heroVisible}
                  onChange={(e) => setHeroVisible(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500"
                />
                <span className="text-white font-semibold">Hero Section Visible on Homepage</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
              Why Choose Us Section
            </h3>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Section Title</label>
              <input
                type="text"
                value={whyTitle}
                onChange={(e) => setWhyTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Section Description</label>
              <textarea
                rows={2}
                value={whyDesc}
                onChange={(e) => setWhyDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={heroSaving}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{heroSaving ? 'Saving...' : 'Publish Hero Changes'}</span>
          </button>
        </form>
      )}

      {/* 2. ANNOUNCEMENTS TAB */}
      {cmsSubTab === 'announcements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Top-bar alert banners displayed at the very pinnacle of the website.
            </p>
            <button
              onClick={openAnnounceCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Announcement</span>
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {a.active ? 'Active' : 'Disabled'}
                    </span>
                    <span className="font-semibold text-white">{a.text}</span>
                  </div>
                  {a.linkUrl && (
                    <p className="text-[11px] text-slate-500 mt-1 truncate">Link: {a.linkUrl}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openAnnounceEdit(a)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ type: 'announcement', id: a.id, name: a.text })}
                    className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FEATURES TAB */}
      {cmsSubTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Hardware feature highlight cards on the homepage.
            </p>
            <button
              onClick={openFeatCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feature Card</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{f.title}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openFeatEdit(f)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'feature', id: f.id, name: f.title })}
                      className="p-1.5 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400">{f.description}</p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                  <span>Icon: {f.icon}</span>
                  {f.badge && <span className="text-emerald-400 font-bold">• Badge: {f.badge}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. FAQ TAB */}
      {cmsSubTab === 'faq' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Interactive accordion questions and answers.
            </p>
            <button
              onClick={openFaqCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ Question</span>
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((q) => (
              <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{q.question}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openFaqEdit(q)}
                      className="p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'faq', id: q.id, name: q.question })}
                      className="p-1.5 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-300">{q.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. REVIEWS TAB */}
      {cmsSubTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Community reviews and testimonials from server owners.
            </p>
            <button
              onClick={openReviewCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">{r.authorName}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openReviewEdit(r)}
                        className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'review', id: r.id, name: r.authorName })}
                        className="p-1 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium">{r.authorRole}</p>
                  <p className="mt-2 text-slate-300 italic">"{r.reviewText}"</p>
                </div>
                <div className="mt-4 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Rating: {r.rating} / 5 Stars</span>
                  {r.verified && <span className="text-emerald-400">Verified</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals for Announcements, Features, FAQs, Reviews */}
      {announceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveAnnounce} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-3 text-xs">
            <h3 className="text-base font-bold text-white">
              {editingAnnounce ? 'Edit Announcement' : 'New Announcement'}
            </h3>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Banner Text *</label>
              <input
                type="text"
                required
                value={announceText}
                onChange={(e) => setAnnounceText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="e.g. FLASH SALE: 20% off with code NOVASMP"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Link URL (Optional)</label>
              <input
                type="text"
                value={announceLink}
                onChange={(e) => setAnnounceLink(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="#plans or https://discord.gg"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={announceActive}
                onChange={(e) => setAnnounceActive(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500"
              />
              <span className="text-white">Active (Display top bar)</span>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAnnounceModal(false)}
                className="px-3 py-1.5 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {featModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveFeat} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-3 text-xs">
            <h3 className="text-base font-bold text-white">{editingFeat ? 'Edit Feature' : 'New Feature'}</h3>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Title *</label>
              <input
                type="text"
                required
                value={featTitle}
                onChange={(e) => setFeatTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description *</label>
              <textarea
                rows={2}
                required
                value={featDesc}
                onChange={(e) => setFeatDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Icon</label>
                <select
                  value={featIcon}
                  onChange={(e) => setFeatIcon(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                >
                  <option value="Cpu">Cpu</option>
                  <option value="ShieldCheck">ShieldCheck</option>
                  <option value="HardDrive">HardDrive</option>
                  <option value="Server">Server</option>
                  <option value="MessageSquare">MessageSquare</option>
                  <option value="Activity">Activity</option>
                  <option value="Globe">Globe</option>
                  <option value="Lock">Lock</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={featBadge}
                  onChange={(e) => setFeatBadge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  placeholder="e.g. 5.7 GHz"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFeatModal(false)}
                className="px-3 py-1.5 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
              >
                Save Feature
              </button>
            </div>
          </form>
        </div>
      )}

      {faqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveFaq} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-3 text-xs">
            <h3 className="text-base font-bold text-white">{editingFaq ? 'Edit FAQ' : 'New FAQ'}</h3>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Question *</label>
              <input
                type="text"
                required
                value={faqQuestion}
                onChange={(e) => setFaqQuestion(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Answer *</label>
              <textarea
                rows={3}
                required
                value={faqAnswer}
                onChange={(e) => setFaqAnswer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFaqModal(false)}
                className="px-3 py-1.5 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
              >
                Save Question
              </button>
            </div>
          </form>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleSaveReview} className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-3 text-xs">
            <h3 className="text-base font-bold text-white">{editingReview ? 'Edit Review' : 'New Review'}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  value={revAuthor}
                  onChange={(e) => setRevAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role / Community</label>
                <input
                  type="text"
                  required
                  value={revRole}
                  onChange={(e) => setRevRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  placeholder="e.g. SMP Creator"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Rating (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={revRating}
                onChange={(e) => setRevRating(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Review Text *</label>
              <textarea
                rows={3}
                required
                value={revText}
                onChange={(e) => setRevText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal(false)}
                className="px-3 py-1.5 text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
              >
                Save Review
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Item?</h3>
            <p className="text-xs text-slate-400">
              Delete "{deleteTarget.name}"? This action cannot be reversed.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold bg-rose-500 text-white rounded-xl"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
