import React, { useEffect, useState } from 'react';
import {
  Layers,
  Users,
  MessageSquare,
  Activity,
  CheckCircle,
  ExternalLink,
  Shield,
  Plus,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { useSettings } from '../../firebase/settingsContext';
import { useAuth } from '../../firebase/authContext';
import {
  fetchPlans,
  fetchAllUsers,
  fetchOrders,
  fetchActivityLogs,
} from '../../firebase/firestoreService';
import { ActivityLog } from '../../types';
import { AdminSection } from './AdminLayout';

interface AdminDashboardTabProps {
  onNavigate: (section: AdminSection) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ onNavigate }) => {
  const { websiteSettings, discordSettings } = useSettings();
  const { adminRole, user } = useAuth();

  const [planCount, setPlanCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const [plans, users, orders, logs] = await Promise.all([
          fetchPlans(),
          fetchAllUsers(),
          fetchOrders(),
          fetchActivityLogs(6),
        ]);
        setPlanCount(plans.filter((p) => p.active).length);
        setUserCount(users.length);
        setOrderCount(orders.length);
        setRecentLogs(logs);
      } catch (err) {
        console.warn('Dashboard stats load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOverview();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {adminRole || 'Administrator'}
            </span>
            <span className="text-xs text-slate-400">Live Database Synced</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1.5">
            Admin Management Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Live control panel for <strong className="text-white">{websiteSettings.websiteName}</strong>. Any changes you publish will immediately propagate to the public storefront, user dashboards, and Discord buttons.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('plans')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
          <button
            onClick={() => onNavigate('website-settings')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Website Branding</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigate('plans')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Plans</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{planCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Live hosting packages</p>
        </div>

        <div
          onClick={() => onNavigate('users')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Registered Users</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{userCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Player accounts</p>
        </div>

        <div
          onClick={() => onNavigate('support')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Discord Orders & Inquiries</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-white mt-3">{orderCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Customer order intents</p>
        </div>

        <div
          onClick={() => onNavigate('discord-settings')}
          className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-[#5865F2]/40 rounded-2xl p-5 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Discord Integration</span>
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#7983f5] group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-bold text-white mt-3 truncate">{discordSettings.serverName}</p>
          <p className="text-[11px] text-emerald-400 mt-1">Live destination active</p>
        </div>
      </div>

      {/* Grid: Live Discord Settings Status + Recent Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discord Config Status Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#7983f5]" />
              <span>Current Discord Router</span>
            </h3>
            <button
              onClick={() => onNavigate('discord-settings')}
              className="text-xs text-amber-400 hover:underline"
            >
              Configure
            </button>
          </div>

          <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Main Server Invite:</span>
              <a
                href={discordSettings.mainInviteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline truncate block"
              >
                {discordSettings.mainInviteUrl}
              </a>
            </div>
            <div className="pt-2 border-t border-slate-900">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Button CTA Label:</span>
              <span className="text-white font-semibold">{discordSettings.buttonText}</span>
            </div>
            <div className="pt-2 border-t border-slate-900">
              <span className="text-slate-500 text-[10px] block uppercase font-bold">Server Community:</span>
              <span className="text-slate-300">{discordSettings.serverName}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            All "Buy Plan" buttons dynamically redirect prospective buyers to this Discord invite. Changing it in the Discord Settings tab will immediately update all buttons across the entire website.
          </p>
        </div>

        {/* Recent Activity Logs */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Recent Activity & Audit Timeline</span>
            </h3>
            <button
              onClick={() => onNavigate('logs')}
              className="text-xs text-amber-400 hover:underline"
            >
              View Full Logs
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No activity recorded yet. System ready.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                        {log.actorRole}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5">{log.details}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 block font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">
                      {log.actorEmail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
