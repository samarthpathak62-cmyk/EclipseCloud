import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  User,
  Layers,
  Bell,
  HelpCircle,
  MessageSquare,
  Settings as SettingsIcon,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Shield,
  Send,
  Save,
  ArrowRight,
  Filter,
  Search,
  MessageCircle,
  Tag,
  ChevronRight,
  CheckCheck,
  RefreshCw,
  X,
  Plus,
  LifeBuoy,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useAuth } from '../firebase/authContext';
import { useSettings } from '../firebase/settingsContext';
import {
  fetchOrders,
  fetchNotifications,
  fetchTickets,
  subscribeToUserTickets,
  createSupportTicket,
  addTicketResponse,
  updateTicketStatus,
  permanentlyCloseTicket,
} from '../firebase/firestoreService';
import { OrderRequest, AppNotification, SupportTicket } from '../types';

interface UserDashboardProps {
  onBackToStorefront: () => void;
  onExplorePlans: () => void;
  initialTab?: 'overview' | 'profile' | 'orders' | 'notifications' | 'support' | 'discord' | 'settings';
  highlightTicketId?: string | null;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onBackToStorefront,
  onExplorePlans,
  initialTab,
  highlightTicketId,
}) => {
  const { user, userProfile, updateProfileDetails, logout } = useAuth();
  const { websiteSettings, discordSettings } = useSettings();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'profile' | 'orders' | 'notifications' | 'support' | 'discord' | 'settings'
  >(initialTab || 'overview');

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Profile Edit State
  const [editUsername, setEditUsername] = useState(userProfile?.displayName || '');
  const [editPhotoUrl, setEditPhotoUrl] = useState(userProfile?.photoURL || '');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Enhanced Support Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Technical & Server Issue');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>('all');
  const [ticketSearch, setTicketSearch] = useState('');

  // Selected Ticket to view thread & reply
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');
  const [ticketReplySending, setTicketReplySending] = useState(false);
  const [confirmCloseTicketModal, setConfirmCloseTicketModal] = useState<string | null>(null);

  const loadUserData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [oList, nList, tList] = await Promise.all([
        fetchOrders(user.uid),
        fetchNotifications(user.uid),
        fetchTickets(user.uid),
      ]);
      setOrders(oList);
      setNotifications(nList);
      setTickets(tList);
      if (selectedTicket) {
        const refreshed = tList.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (e) {
      console.warn('Error loading user dashboard records:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadUserData();
    if (!user?.uid) return;
    const unsub = subscribeToUserTickets(user.uid, (tList) => {
      setTickets(tList);
      setSelectedTicket((prev) => {
        if (!prev) return null;
        const refreshed = tList.find((t) => t.id === prev.id);
        return refreshed || prev;
      });
    });
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (highlightTicketId && tickets.length > 0) {
      const match = tickets.find((t) => t.id === highlightTicketId);
      if (match) {
        setSelectedTicket(match);
      }
    }
  }, [highlightTicketId, tickets]);

  useEffect(() => {
    if (userProfile?.displayName) {
      setEditUsername(userProfile.displayName);
    }
    if (userProfile?.photoURL) {
      setEditPhotoUrl(userProfile.photoURL);
    }
  }, [userProfile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) return;
    await updateProfileDetails(editUsername.trim(), editPhotoUrl.trim());
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 3000);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSubmitting(true);
    try {
      const newTicketId = await createSupportTicket({
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.displayName || (user.email ? user.email.split('@')[0] : 'Player'),
        subject: ticketSubject.trim(),
        category: ticketCategory,
        message: ticketMessage.trim(),
        priority: ticketPriority,
      });
      setTicketSubject('');
      setTicketMessage('');
      setTicketCategory('Technical & Server Issue');
      setTicketPriority('Medium');
      setTicketSuccess(true);
      setIsCreatingTicket(false);
      await loadUserData();
      setTimeout(() => setTicketSuccess(false), 4000);
    } catch (err) {
      console.error('Ticket submission error:', err);
    } finally {
      setTicketSubmitting(false);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyText.trim()) return;
    setTicketReplySending(true);
    try {
      await addTicketResponse(
        selectedTicket.id,
        {
          sender: userProfile?.displayName || user?.email?.split('@')[0] || 'Player',
          senderRole: 'User',
          message: ticketReplyText.trim(),
        },
        'Open'
      );
      setTicketReplyText('');
      await loadUserData();
      const freshTickets = await fetchTickets(user?.uid);
      const updated = freshTickets.find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      console.error('Error replying to ticket:', err);
    } finally {
      setTicketReplySending(false);
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      await updateTicketStatus(ticketId, 'Resolved', user?.email || 'User');
      await loadUserData();
      const freshTickets = await fetchTickets(user?.uid);
      const updated = freshTickets.find((t) => t.id === ticketId);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      console.error('Error resolving ticket:', err);
    }
  };

  const handleReopenTicket = async (ticketId: string) => {
    try {
      await updateTicketStatus(ticketId, 'Open', user?.email || 'User');
      await loadUserData();
      const freshTickets = await fetchTickets(user?.uid);
      const updated = freshTickets.find((t) => t.id === ticketId);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      console.error('Error reopening ticket:', err);
    }
  };

  const handlePermanentlyCloseTicket = (ticketId: string) => {
    setConfirmCloseTicketModal(ticketId);
  };

  const executePermanentlyCloseTicket = async (ticketId: string) => {
    try {
      setConfirmCloseTicketModal(null);
      await permanentlyCloseTicket(ticketId, user?.email || 'User');
      await loadUserData();
      const freshTickets = await fetchTickets(user?.uid);
      const updated = freshTickets.find((t) => t.id === ticketId);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      console.error('Error permanently closing ticket:', err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center">
          <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white">Authentication Required</h2>
          <p className="text-xs text-slate-400 mt-2">
            Please log in or register to access your personal dashboard.
          </p>
          <button
            onClick={onBackToStorefront}
            className="mt-6 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'orders', label: 'My Plans / Orders', icon: Layers, badge: orders.length },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notifications.length },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: HelpCircle,
      badge: tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Answered').length,
    },
    { id: 'discord', label: 'Official Discord', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-md">
              {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">
                  Welcome, {userProfile?.displayName || 'Player'}
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={onBackToStorefront}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              ← Back to Storefront
            </button>
            <a
              href={discordSettings.mainInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Join Discord</span>
            </a>
          </div>
        </div>

        {/* Dashboard Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-1 bg-slate-900/70 border border-slate-800 p-3 rounded-2xl h-fit">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
              Dashboard Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`user-dash-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Tracked Inquiries</span>
                      <Layers className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{orders.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Discord plan requests</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">Support Inquiries</span>
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{tickets.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Direct inquiries opened</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400">System Notices</span>
                      <Bell className="w-4 h-4 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-white mt-2">{notifications.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">Broadcasts from Admin</p>
                  </div>
                </div>

                {/* Discord Order Workflow banner */}
                <div className="bg-gradient-to-r from-slate-900 via-[#5865F2]/10 to-slate-900 border border-[#5865F2]/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-lg">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Discord-Powered Deployment Desk
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        At <strong className="text-emerald-400">{websiteSettings.websiteName}</strong>, all server orders and configuration requests are fulfilled directly through our Official Discord Server. Simply choose a plan, join our Discord, and open a quick order ticket for instant setup assistance!
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          onClick={onExplorePlans}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                        >
                          Browse Server Plans
                        </button>
                        <a
                          href={discordSettings.orderInviteUrl || discordSettings.mainInviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Open Discord Order Desk</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries List */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Recent Plan Inquiries</h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No plan inquiries recorded yet. Explore our hosting plans and click "Buy Plan on Discord"!
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-800">
                      {orders.slice(0, 3).map((o) => (
                        <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white">{o.planName}</p>
                            <p className="text-slate-400 text-[11px]">
                              {o.planRam} • {o.planCpu} • {o.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {o.status}
                            </span>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. MY PLANS / ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">My Plans & Inquiries</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Track your requested Minecraft hosting hardware orders initiated for Discord fulfillment.
                    </p>
                  </div>
                  <button
                    onClick={onExplorePlans}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
                  >
                    + Explore Plans
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-slate-950/60 rounded-xl border border-slate-800 p-6">
                    <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-white">No plans requested yet</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Whenever you click "Buy Plan" on our storefront, your request is logged here for quick reference when talking with staff on Discord.
                    </p>
                    <button
                      onClick={onExplorePlans}
                      className="mt-4 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950"
                    >
                      Browse Tier Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                              {order.category}
                            </span>
                            <h4 className="text-base font-bold text-white mt-0.5">{order.planName}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {order.status}
                            </span>
                            <span className="text-base font-black text-white">
                              {order.planCurrency}{order.planPrice}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-900 rounded-lg text-xs text-slate-300">
                          <div>
                            <span className="text-slate-500 text-[10px] block">RAM:</span>
                            <span className="font-semibold">{order.planRam}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">CPU:</span>
                            <span className="font-semibold">{order.planCpu}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block">Storage:</span>
                            <span className="font-semibold">{order.planStorage}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs pt-2 border-t border-slate-800/60">
                          <span className="text-slate-500 text-[11px]">
                            Inquiry Created: {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <a
                            href={order.discordInviteUsed || discordSettings.orderInviteUrl || discordSettings.mainInviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Continue on Discord</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Account Profile</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage your player credentials and display identity.
                  </p>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Profile saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username / In-Game Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email Address (Read-only)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user.email || ''}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Avatar URL (Optional)
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      value={editPhotoUrl}
                      onChange={(e) => setEditPhotoUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>

                <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-1">
                  <p>Account UID: <span className="font-mono text-slate-300">{user.uid}</span></p>
                  <p>Account Created: <span className="text-slate-300">{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleString() : 'N/A'}</span></p>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Announcements and administrative notices sent to your account.
                  </p>
                </div>

                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No notifications yet. Check back soon for server announcements!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{n.title}</h4>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. SUPPORT & INQUIRIES TAB */}
            {activeTab === 'support' && (
              <div className="space-y-6">
                {/* Header with quick actions */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                      <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Customer Support & Help Desk</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Submit issues directly to the admin queue. Track responses and resolve tickets in real time.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={loadUserData}
                      disabled={loadingData}
                      title="Refresh tickets"
                      className="p-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-emerald-400' : ''}`} />
                    </button>
                    <button
                      onClick={() => setIsCreatingTicket(!isCreatingTicket)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10"
                    >
                      {isCreatingTicket ? (
                        <>
                          <X className="w-4 h-4" />
                          <span>Close Form</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Open New Ticket</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Status KPI Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div
                    onClick={() => setTicketFilterStatus('all')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      ticketFilterStatus === 'all'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Total Tickets</span>
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <p className="text-2xl font-black text-white mt-1">{tickets.length}</p>
                    <p className="text-[10px] text-slate-500">All submitted inquiries</p>
                  </div>

                  <div
                    onClick={() => setTicketFilterStatus('active')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      ticketFilterStatus === 'active'
                        ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">In Queue</span>
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black text-amber-400 mt-1">
                      {tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length}
                    </p>
                    <p className="text-[10px] text-slate-500">Open or under review</p>
                  </div>

                  <div
                    onClick={() => setTicketFilterStatus('answered')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      ticketFilterStatus === 'answered'
                        ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Staff Replied</span>
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-black text-purple-400 mt-1">
                      {tickets.filter((t) => t.status === 'Answered').length}
                    </p>
                    <p className="text-[10px] text-slate-500">Awaiting your response</p>
                  </div>

                  <div
                    onClick={() => setTicketFilterStatus('resolved')}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      ticketFilterStatus === 'resolved'
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">Resolved</span>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <p className="text-2xl font-black text-emerald-400 mt-1">
                      {tickets.filter((t) => t.status === 'Resolved').length}
                    </p>
                    <p className="text-[10px] text-slate-500">Successfully closed</p>
                  </div>
                </div>

                {ticketSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-lg shadow-emerald-950/30">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>Success!</strong> Your support ticket has been added to the administrative queue.
                      </span>
                    </div>
                    <button
                      onClick={() => setTicketSuccess(false)}
                      className="text-emerald-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Collapsible New Support Ticket Form */}
                {isCreatingTicket && (
                  <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-400" />
                          <span>Submit Ticket to Queue</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Describe your issue in detail. Our administrators will review and reply.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsCreatingTicket(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleCreateTicket} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Issue Category <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Technical & Server Issue">Technical & Server Performance</option>
                            <option value="Modpack & Plugin Setup">Plugin & Modpack Configuration</option>
                            <option value="Billing & Order Assistance">Billing & Order Assistance</option>
                            <option value="Server Upgrade & RAM Inquiry">Server Upgrade & RAM Inquiry</option>
                            <option value="Discord Role Verification">Discord Role Verification</option>
                            <option value="General Question">General Question</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            Urgency / Priority <span className="text-rose-400">*</span>
                          </label>
                          <select
                            value={ticketPriority}
                            onChange={(e) => setTicketPriority(e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Low">Low (General question / low urgency)</option>
                            <option value="Medium">Medium (Standard configuration help)</option>
                            <option value="High">High (Gameplay or server degraded)</option>
                            <option value="Urgent">Urgent (Server crash / immediate attention)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Ticket Subject <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., Paper 1.21 memory leak warning on startup"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Detailed Description & Logs <span className="text-rose-400">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Provide details of your problem: Minecraft server version, installed plugins/mods, steps that triggered the error, or relevant error logs..."
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsCreatingTicket(false)}
                          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={ticketSubmitting}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{ticketSubmitting ? 'Submitting...' : 'Submit to Support Queue'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tickets by subject or ID..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    {ticketSearch && (
                      <button
                        onClick={() => setTicketSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                    {[
                      { id: 'all', label: `All (${tickets.length})` },
                      {
                        id: 'active',
                        label: `Active (${tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length})`,
                      },
                      {
                        id: 'answered',
                        label: `Staff Replied (${tickets.filter((t) => t.status === 'Answered').length})`,
                      },
                      {
                        id: 'resolved',
                        label: `Resolved (${tickets.filter((t) => t.status === 'Resolved').length})`,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setTicketFilterStatus(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          ticketFilterStatus === tab.id
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 mx-auto">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">No Support Tickets Yet</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Have questions about your server, plugin errors, or Discord permissions? Submit your inquiry to our administrative queue.
                      </p>
                      <button
                        onClick={() => setIsCreatingTicket(true)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Your First Ticket</span>
                      </button>
                    </div>
                  ) : (
                    tickets
                      .filter((t) => {
                        const matchesFilter =
                          ticketFilterStatus === 'all'
                            ? true
                            : ticketFilterStatus === 'active'
                            ? t.status === 'Open' || t.status === 'In Progress'
                            : ticketFilterStatus === 'answered'
                            ? t.status === 'Answered'
                            : ticketFilterStatus === 'resolved'
                            ? t.status === 'Resolved'
                            : true;

                        const matchesSearch =
                          ticketSearch.trim() === '' ||
                          t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          t.id.toLowerCase().includes(ticketSearch.toLowerCase()) ||
                          (t.category && t.category.toLowerCase().includes(ticketSearch.toLowerCase())) ||
                          t.message.toLowerCase().includes(ticketSearch.toLowerCase());

                        return matchesFilter && matchesSearch;
                      })
                      .map((ticket) => {
                        const responseCount = (ticket.responses || []).length;
                        const hasAdminReply = (ticket.responses || []).some(
                          (r) => r.senderRole === 'Admin' || r.senderRole === 'Support'
                        );

                        return (
                          <div
                            key={ticket.id}
                            className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all space-y-3 shadow-md"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2.5">
                              <div className="flex flex-wrap items-center gap-2">
                                {/* Priority badge */}
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                                    ticket.priority === 'Urgent'
                                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                      : ticket.priority === 'High'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : ticket.priority === 'Medium'
                                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                                      : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {ticket.priority} Priority
                                </span>

                                {/* Status badge */}
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                    ticket.status === 'Open'
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                      : ticket.status === 'In Progress'
                                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                      : ticket.status === 'Answered'
                                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-extrabold'
                                      : ticket.status === 'Resolved'
                                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {ticket.status === 'Answered' ? 'Staff Replied' : ticket.status}
                                </span>

                                {ticket.category && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-400 border border-slate-700/60">
                                    {ticket.category}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                <span className="font-mono text-[10px] text-slate-500">#{ticket.id}</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                                {ticket.subject}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {ticket.message}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{responseCount} {responseCount === 1 ? 'reply' : 'replies'}</span>
                                </span>

                                {hasAdminReply && (
                                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    <span>Staff Active</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {ticket.status !== 'Resolved' && (
                                  <button
                                    onClick={() => handleResolveTicket(ticket.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-400 border border-slate-700 transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Mark Resolved</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedTicket(ticket)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 hover:border-emerald-500 transition-all flex items-center gap-1.5"
                                >
                                  <span>View Discussion</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {/* 6. DISCORD TAB */}
            {activeTab === 'discord' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Official Discord Server</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Connect with our staff and player community.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#5865F2]/20 border border-[#5865F2]/30 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white shadow-xl shadow-[#5865F2]/25">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-white">{discordSettings.serverName}</h4>
                      <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                        {discordSettings.memberCountEstimate || '18,400+ Discord Members'}
                      </p>
                      <p className="text-xs text-slate-300 mt-2 max-w-md">
                        {discordSettings.description}
                      </p>
                    </div>
                  </div>

                  <a
                    href={discordSettings.mainInviteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 rounded-xl text-sm font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-lg transition-all shrink-0 inline-flex items-center gap-2"
                  >
                    <span>{discordSettings.buttonText || 'Join Official Discord'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h5 className="font-bold text-white mb-1">#order-support Channel</h5>
                    <p className="text-slate-400">
                      Open an ordering ticket to configure your customized RAM, disk space, and custom domain with direct operator assistance.
                    </p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <h5 className="font-bold text-white mb-1">24/7 Priority Emergency Channel</h5>
                    <p className="text-slate-400">
                      Direct ping access to on-duty network administrators for instantaneous node status checks.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 7. SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Account Settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Security preferences and session management.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-white">Session Security</h4>
                    <p className="text-xs text-slate-400">
                      You are signed in as <strong className="text-white">{user.email}</strong>.
                    </p>
                    <button
                      onClick={logout}
                      className="mt-2 px-4 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
                    >
                      Sign Out of Session
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE SUPPORT TICKET DISCUSSION MODAL                   */}
        {/* ============================================================ */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
                <div className="space-y-1.5 pr-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                        selectedTicket.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : selectedTicket.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : selectedTicket.priority === 'Medium'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {selectedTicket.priority} Priority
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        selectedTicket.status === 'Open'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : selectedTicket.status === 'In Progress'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : selectedTicket.status === 'Answered'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30 font-bold'
                          : selectedTicket.status === 'Resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {selectedTicket.status === 'Answered' ? 'Staff Replied' : selectedTicket.status}
                    </span>

                    {selectedTicket.category && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                        {selectedTicket.category}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-slate-500">#{selectedTicket.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {selectedTicket.subject}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Thread Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Original inquiry message */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                        {selectedTicket.userName ? selectedTicket.userName[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white">{selectedTicket.userName || 'You'}</span>
                        <span className="text-[10px] ml-1.5 px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          Author
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Responses Thread */}
                {selectedTicket.responses && selectedTicket.responses.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-800" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Conversation Thread ({selectedTicket.responses.length})
                      </span>
                      <div className="h-px flex-1 bg-slate-800" />
                    </div>

                    {selectedTicket.responses.map((resp) => {
                      const isStaff = resp.senderRole === 'Admin' || resp.senderRole === 'Support';
                      return (
                        <div
                          key={resp.id}
                          className={`p-4 rounded-xl text-xs space-y-1.5 border transition-all ${
                            isStaff
                              ? 'bg-emerald-950/25 border-emerald-500/30 text-emerald-100 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isStaff ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                  <Shield className="w-3.5 h-3.5" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                                  {resp.sender ? resp.sender[0].toUpperCase() : 'U'}
                                </div>
                              )}
                              <span className={`font-bold ${isStaff ? 'text-emerald-300' : 'text-white'}`}>
                                {resp.sender}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  isStaff
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {isStaff ? 'Staff Support' : 'You'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              {new Date(resp.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed pl-8">
                            {resp.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center space-y-1">
                    <p className="text-xs font-semibold text-slate-400">
                      Inquiry received in administrative queue
                    </p>
                    <p className="text-[11px] text-slate-500">
                      No staff response yet. Our support agents usually reply within a short time. You can add more details below.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Reply & Resolution Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/70 space-y-3">
                {selectedTicket.isPermanentlyClosed || selectedTicket.status === 'Closed' ? (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>This support ticket has been permanently closed. If you require further assistance, please open a new ticket.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <>
                    {selectedTicket.status === 'Resolved' && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>This inquiry is marked as resolved. Need more help?</span>
                        </div>
                        <button
                          onClick={() => handleReopenTicket(selectedTicket.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                        >
                          Reopen Ticket
                        </button>
                      </div>
                    )}

                    <form onSubmit={handleSendTicketReply} className="space-y-2.5">
                      <textarea
                        rows={3}
                        placeholder="Type your reply or additional information..."
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
                      />

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {selectedTicket.status !== 'Resolved' && (
                            <button
                              type="button"
                              onClick={() => handleResolveTicket(selectedTicket.id)}
                              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark as Resolved</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handlePermanentlyCloseTicket(selectedTicket.id)}
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Permanently Close</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTicket(null)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          >
                            Close Window
                          </button>
                          <button
                            type="submit"
                            disabled={ticketReplySending || !ticketReplyText.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-emerald-500/20"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{ticketReplySending ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Permanently Close Ticket Confirmation Modal */}
        {confirmCloseTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
              <Lock className="w-8 h-8 text-rose-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Permanently Close Ticket?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently close ticket <strong className="text-white">#{confirmCloseTicketModal}</strong>? Once closed, you will not be able to send further messages.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmCloseTicketModal(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executePermanentlyCloseTicket(confirmCloseTicketModal)}
                  className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all"
                >
                  Lock & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
