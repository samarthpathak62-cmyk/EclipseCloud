import React, { useEffect, useState } from 'react';
import {
  Bell,
  Send,
  Users,
  CheckCircle,
  Clock,
  Radio,
  Trash2,
} from 'lucide-react';
import { AppNotification, UserProfile } from '../../types';
import {
  fetchNotifications,
  createNotification,
  fetchAllUsers,
  deleteNotificationDoc,
} from '../../firebase/firestoreService';
import { useAuth } from '../../firebase/authContext';

export const AdminNotificationsTab: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'System' | 'Announcement' | 'Promotion' | 'Account'>('System');

  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [nList, uList] = await Promise.all([
        fetchNotifications(),
        fetchAllUsers(),
      ]);
      setNotifications(nList);
      setUsers(uList);
    } catch (err) {
      console.warn('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setSending(true);

    try {
      const targetUser = users.find((u) => u.uid === targetUserId);

      await createNotification({
        title: title.trim(),
        message: message.trim(),
        type,
        targetUserId: targetType === 'single' ? targetUserId : undefined,
        targetUserEmail: targetType === 'single' ? targetUser?.email : undefined,
      });

      setTitle('');
      setMessage('');
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      await loadData();
    } catch (err) {
      console.error('Error dispatching notification:', err);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteNotificationDoc(id);
    await loadData();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Broadcast Notifications Dispatcher</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Transmit real-time system notices, maintenance alerts, or promotions to all players or targeted individual users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl h-fit">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Send className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Dispatch New Notice</h3>
          </div>

          {sendSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Notice successfully broadcast!</span>
            </div>
          )}

          <form onSubmit={handleSendNotification} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetType('all')}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center ${
                    targetType === 'all'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Broadcast (All)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType('single')}
                  className={`py-2 px-3 rounded-xl font-semibold border transition-all text-center ${
                    targetType === 'single'
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Single User
                </button>
              </div>
            </div>

            {targetType === 'single' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select User *</label>
                <select
                  required
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                >
                  <option value="">Choose a user...</option>
                  {users.map((u) => (
                    <option key={u.uid} value={u.uid}>
                      {u.displayName ? `${u.displayName} (${u.email})` : u.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notice Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
              >
                <option value="System">System / Maintenance</option>
                <option value="Announcement">Server Announcement</option>
                <option value="Promotion">Promotion / Deal</option>
                <option value="Account">Account Status</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Headline Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                placeholder="e.g. Frankfurt Node Upgrade Complete"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Notice Body Text *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                placeholder="Details of the announcement displayed in user notifications list..."
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Dispatching...' : 'Dispatch Notification'}</span>
            </button>
          </form>
        </div>

        {/* Notifications History List */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Broadcast History & Sent Log</h3>
            </div>
            <span className="text-xs text-slate-500">{notifications.length} dispatched</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications dispatched yet.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                          {n.type}
                        </span>
                        <h4 className="font-bold text-white text-sm">{n.title}</h4>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Target: <span className="text-emerald-400">{n.targetUserEmail ? `User (${n.targetUserEmail})` : 'All Users (Broadcast)'}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => handleDelete(n.id)}
                        className="p-1 rounded bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
