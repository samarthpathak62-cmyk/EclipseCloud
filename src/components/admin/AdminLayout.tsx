import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  Settings,
  MessageSquare,
  Home,
  Users,
  Shield,
  Bell,
  HelpCircle,
  FileText,
  Share2,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../firebase/authContext';
import { useSettings } from '../../firebase/settingsContext';

export type AdminSection =
  | 'dashboard'
  | 'plans'
  | 'categories'
  | 'website-settings'
  | 'discord-settings'
  | 'homepage-cms'
  | 'users'
  | 'admins-roles'
  | 'notifications'
  | 'support'
  | 'logs';

interface AdminLayoutProps {
  currentSection: AdminSection;
  setCurrentSection: (sec: AdminSection) => void;
  onExitToWebsite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentSection,
  setCurrentSection,
  onExitToWebsite,
  children,
}) => {
  const { user, userProfile, isAdmin, adminRole, hasPermission, logout } = useAuth();
  const { websiteSettings, discordSettings } = useSettings();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const menuItems: {
    id: AdminSection;
    label: string;
    icon: any;
    permissionReq?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permissionReq: 'View Dashboard' },
    { id: 'plans', label: 'Plans Manager', icon: Layers, permissionReq: 'Manage Plans' },
    { id: 'categories', label: 'Plan Categories', icon: FolderTree, permissionReq: 'Manage Categories' },
    { id: 'website-settings', label: 'Website Settings', icon: Settings, permissionReq: 'Manage Website' },
    { id: 'discord-settings', label: 'Discord Settings', icon: MessageSquare, permissionReq: 'Manage Discord Settings' },
    { id: 'homepage-cms', label: 'Homepage CMS', icon: Home, permissionReq: 'Manage Homepage' },
    { id: 'users', label: 'Users Manager', icon: Users, permissionReq: 'Manage Users' },
    { id: 'admins-roles', label: 'Admins & Roles', icon: Shield, permissionReq: 'Manage Admins' },
    { id: 'notifications', label: 'Notifications', icon: Bell, permissionReq: 'Manage Notifications' },
    { id: 'support', label: 'Support & Orders', icon: HelpCircle, permissionReq: 'Manage Support' },
    { id: 'logs', label: 'Activity & Audit Logs', icon: FileText, permissionReq: 'View Logs' },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Your current account does not possess administrative privileges in the Firestore database.
          </p>
          <button
            onClick={onExitToWebsite}
            className="mt-6 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white">Admin Control Center</span>
            <span className="text-[10px] text-amber-400 font-semibold block">{adminRole}</span>
          </div>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-300"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex flex-col h-full overflow-y-auto">
          {/* Brand Header */}
          <div className="pb-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white truncate">
                  {websiteSettings.websiteName || 'Eclipse Cloud'}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-bold text-amber-400">{adminRole || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-5 space-y-1 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">
              Management Modules
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              const allowed = !item.permissionReq || hasPermission(item.permissionReq);

              if (!allowed) return null;

              return (
                <button
                  key={item.id}
                  id={`admin-menu-${item.id}`}
                  onClick={() => {
                    setCurrentSection(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </button>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={onExitToWebsite}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
