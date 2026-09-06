import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Server,
  Shield,
  MessageSquare,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ExternalLink,
  ChevronDown,
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';
import { useSettings } from '../firebase/settingsContext';
import { useAuth } from '../firebase/authContext';
import { subscribeToUserTickets } from '../firebase/firestoreService';
import { SupportTicket } from '../types';

interface NavbarProps {
  currentView: 'home' | 'plans' | 'dashboard' | 'admin';
  setCurrentView: (view: 'home' | 'plans' | 'dashboard' | 'admin') => void;
  onOpenSupportTicket?: (ticketId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenSupportTicket,
}) => {
  const { websiteSettings, discordSettings } = useSettings();
  const { user, userProfile, isAdmin, adminRole, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Tickets state for support notification alerts
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [readTokens, setReadTokens] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('user_read_ticket_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe in real-time to tickets created by this user
  useEffect(() => {
    if (!user?.uid) {
      setTickets([]);
      return;
    }
    const unsubscribe = subscribeToUserTickets(user.uid, (userTickets) => {
      setTickets(userTickets);
    });
    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  // Outside click listener to dismiss popovers
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Answered tickets where admin or support staff replied
  const answeredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const hasStaffResponse = (t.responses || []).some(
        (r) => r.senderRole === 'Admin' || r.senderRole === 'Support'
      );
      return t.status === 'Answered' || hasStaffResponse;
    });
  }, [tickets]);

  // Unread answered tickets based on saved acknowledgment tokens
  const unreadAnsweredTickets = useMemo(() => {
    return answeredTickets.filter((t) => {
      const token = `${t.id}_${t.updatedAt || t.createdAt}`;
      return t.status === 'Answered' && !readTokens.includes(token);
    });
  }, [answeredTickets, readTokens]);

  const hasUnread = unreadAnsweredTickets.length > 0;

  const markTicketAsRead = (ticket: SupportTicket) => {
    const token = `${ticket.id}_${ticket.updatedAt || ticket.createdAt}`;
    if (!readTokens.includes(token)) {
      const updated = [...readTokens, token];
      setReadTokens(updated);
      try {
        localStorage.setItem('user_read_ticket_notifications', JSON.stringify(updated));
      } catch {
        // Ignore local storage error
      }
    }
  };

  const markAllAsRead = () => {
    const allTokens = answeredTickets.map((t) => `${t.id}_${t.updatedAt || t.createdAt}`);
    const merged = Array.from(new Set([...readTokens, ...allTokens]));
    setReadTokens(merged);
    try {
      localStorage.setItem('user_read_ticket_notifications', JSON.stringify(merged));
    } catch {
      // Ignore local storage error
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    markTicketAsRead(ticket);
    setNotificationsOpen(false);
    if (onOpenSupportTicket) {
      onOpenSupportTicket(ticket.id);
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleNavClick = (view: 'home' | 'plans') => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch {
      return 'Recently';
    }
  };

  const displayName =
    userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <nav
      id="main-navbar"
      className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left focus:outline-none group"
            >
              {websiteSettings.logoUrl ? (
                <img
                  src={websiteSettings.logoUrl}
                  alt={websiteSettings.websiteName || 'Eclipse Cloud'}
                  className="h-10 w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/30 group-hover:scale-105 transition-transform">
                  <Server className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  {websiteSettings.websiteName || 'Eclipse Cloud'}
                </span>
                <span className="text-[11px] font-medium text-emerald-400 tracking-wider uppercase">
                  Minecraft Infrastructure
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <button
              id="nav-link-home"
              onClick={() => handleNavClick('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              id="nav-link-plans"
              onClick={() => handleNavClick('plans')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'plans'
                  ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Plans
            </button>
            <a
              id="nav-link-features"
              href="#features"
              onClick={() => {
                if (currentView !== 'home') setCurrentView('home');
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Features
            </a>
            <a
              id="nav-link-why"
              href="#why-us"
              onClick={() => {
                if (currentView !== 'home') setCurrentView('home');
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Why Choose Us
            </a>
            <a
              id="nav-link-faq"
              href="#faq"
              onClick={() => {
                if (currentView !== 'home') setCurrentView('home');
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              FAQ
            </a>
            <a
              id="nav-link-reviews"
              href="#reviews"
              onClick={() => {
                if (currentView !== 'home') setCurrentView('home');
              }}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              Reviews
            </a>
          </div>

          {/* Action Area: Discord CTA, Notifications & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dynamic Discord Button */}
            <a
              id="nav-discord-cta-btn"
              href={discordSettings.mainInviteUrl || 'https://discord.gg'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-[#5865F2]/15 text-[#7983f5] border border-[#5865F2]/30 hover:bg-[#5865F2] hover:text-white transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{discordSettings.buttonText || 'Join Discord'}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>

            {/* If Admin: Direct Admin Panel link */}
            {isAdmin && (
              <button
                id="nav-admin-panel-btn"
                onClick={() => setCurrentView('admin')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-200'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500/30 rounded text-amber-200">
                  {adminRole || 'Admin'}
                </span>
              </button>
            )}

            {/* Notification Bell (Visible when user is logged in) */}
            {user && (
              <div className="relative" ref={notificationDropdownRef}>
                <button
                  id="support-notifications-bell-btn"
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserDropdownOpen(false);
                  }}
                  aria-label="Support Ticket Notifications"
                  title={
                    hasUnread
                      ? `${unreadAnsweredTickets.length} new support ticket reply from admin`
                      : 'Support Ticket Alerts'
                  }
                  className={`relative p-2 rounded-xl transition-all border ${
                    hasUnread
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-slate-950 shadow-md shadow-emerald-500/40 animate-pulse">
                      {unreadAnsweredTickets.length}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notificationsOpen && (
                  <div
                    id="support-notifications-dropdown"
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Bell className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-white text-sm">
                          Support Notifications
                        </span>
                        {hasUnread && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {unreadAnsweredTickets.length} New
                          </span>
                        )}
                      </div>

                      {hasUnread && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Ticket List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
                      {answeredTickets.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
                            <LifeBuoy className="w-6 h-6 text-slate-500" />
                          </div>
                          <p className="text-sm font-semibold text-slate-200">
                            No Staff Replies Yet
                          </p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                            When an admin or technician answers your support ticket, you will be
                            alerted right here in real time.
                          </p>
                          <button
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (onOpenSupportTicket) onOpenSupportTicket();
                              else setCurrentView('dashboard');
                            }}
                            className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-emerald-400 hover:bg-slate-700 transition-colors border border-slate-700"
                          >
                            <span>Open Support Desk</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        answeredTickets.map((ticket) => {
                          const isUnread =
                            ticket.status === 'Answered' &&
                            !readTokens.includes(`${ticket.id}_${ticket.updatedAt || ticket.createdAt}`);
                          
                          // Extract last response
                          const lastStaffResponse = [...(ticket.responses || [])]
                            .reverse()
                            .find((r) => r.senderRole === 'Admin' || r.senderRole === 'Support');
                          
                          return (
                            <div
                              key={ticket.id}
                              onClick={() => handleTicketClick(ticket)}
                              className={`p-3.5 hover:bg-slate-800/60 cursor-pointer transition-colors relative group ${
                                isUnread ? 'bg-emerald-500/5' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isUnread ? (
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                  )}
                                  <span className="text-xs font-mono font-bold text-slate-400">
                                    #{ticket.id.slice(-6).toUpperCase()}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 truncate max-w-[100px]">
                                    {ticket.category}
                                  </span>
                                </div>
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(ticket.updatedAt || ticket.createdAt)}
                                </span>
                              </div>

                              <p className="text-xs font-bold text-white mt-1.5 line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                {ticket.subject}
                              </p>

                              {lastStaffResponse ? (
                                <div className="mt-1.5 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex flex-col gap-0.5">
                                  <span className="font-semibold text-emerald-400">
                                    {lastStaffResponse.sender} ({lastStaffResponse.senderRole}):
                                  </span>
                                  <p className="text-slate-300 line-clamp-2 italic">
                                    &ldquo;{lastStaffResponse.message}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[11px] text-emerald-400 font-medium mt-1">
                                  Status updated to Answered by staff
                                </p>
                              )}

                              <div className="mt-2 flex items-center justify-between text-[10px]">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                                  Staff Replied
                                </span>
                                <span className="text-slate-400 group-hover:text-emerald-400 flex items-center gap-1">
                                  Click to view conversation <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {tickets.length} total ticket{tickets.length === 1 ? '' : 's'}
                      </span>
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          if (onOpenSupportTicket) onOpenSupportTicket();
                          else setCurrentView('dashboard');
                        }}
                        className="font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                      >
                        <span>Support Dashboard</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dashboard / Auth Controls */}
            {user ? (
              <div className="relative" ref={userDropdownRef}>
                <button
                  id="user-menu-trigger-btn"
                  onClick={() => {
                    setUserDropdownOpen(!userDropdownOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {userProfile?.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                    </div>

                    <button
                      id="dropdown-dashboard-btn"
                      onClick={() => {
                        setCurrentView('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 text-left transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>User Dashboard</span>
                    </button>

                    <button
                      id="dropdown-support-btn"
                      onClick={() => {
                        if (onOpenSupportTicket) onOpenSupportTicket();
                        else setCurrentView('dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-slate-800/60 text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <LifeBuoy className="w-4 h-4 text-emerald-400" />
                        <span>Support Tickets</span>
                      </div>
                      {hasUnread && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {unreadAnsweredTickets.length}
                        </span>
                      )}
                    </button>

                    {isAdmin && (
                      <button
                        id="dropdown-admin-btn"
                        onClick={() => {
                          setCurrentView('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-300 hover:bg-amber-500/10 text-left transition-colors"
                      >
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Admin Control Center</span>
                      </button>
                    )}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-signin-btn"
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-emerald-500/20"
              >
                <UserIcon className="w-4 h-4" />
                <span>Account Login</span>
              </button>
            )}
          </div>

          {/* Mobile Actions (Bell & Hamburger) */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <button
                id="mobile-support-notifications-bell-btn"
                onClick={() => {
                  if (onOpenSupportTicket) onOpenSupportTicket();
                  else setCurrentView('dashboard');
                }}
                aria-label="Support Ticket Notifications"
                className={`relative p-2 rounded-lg border transition-all ${
                  hasUnread
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-black text-slate-950 animate-pulse">
                    {unreadAnsweredTickets.length}
                  </span>
                )}
              </button>
            )}

            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3"
        >
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-lg text-sm font-medium text-center ${
                currentView === 'home'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('plans')}
              className={`p-2.5 rounded-lg text-sm font-medium text-center ${
                currentView === 'plans'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-300'
              }`}
            >
              Hosting Plans
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30"
              >
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </button>
            )}

            {user ? (
              <>
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-slate-200 border border-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                  <span>User Dashboard ({displayName})</span>
                </button>

                <button
                  onClick={() => {
                    if (onOpenSupportTicket) onOpenSupportTicket();
                    else setCurrentView('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-slate-200 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-emerald-400" />
                    <span>Support Tickets</span>
                  </div>
                  {hasUnread && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      {unreadAnsweredTickets.length} Replied
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  openAuthModal('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-bold bg-emerald-500 text-slate-950"
              >
                <UserIcon className="w-4 h-4" />
                <span>Account Login / Register</span>
              </button>
            )}

            <a
              href={discordSettings.mainInviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-semibold bg-[#5865F2] text-white"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{discordSettings.buttonText || 'Join Discord'}</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
