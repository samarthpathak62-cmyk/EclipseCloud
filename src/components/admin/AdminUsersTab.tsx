import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Bell,
  Layers,
  Shield,
  Send,
  Calendar,
  Eye,
} from 'lucide-react';
import { UserProfile, OrderRequest } from '../../types';
import {
  fetchAllUsers,
  fetchOrders,
  createNotification,
  saveUserProfile,
} from '../../firebase/firestoreService';
import { useAuth } from '../../firebase/authContext';

export const AdminUsersTab: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Notify Modal
  const [targetUserForNotice, setTargetUserForNotice] = useState<UserProfile | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [noticeSending, setNoticeSending] = useState(false);
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // User Orders View Modal
  const [viewOrdersUser, setViewOrdersUser] = useState<UserProfile | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, oList] = await Promise.all([fetchAllUsers(), fetchOrders()]);
      setUsers(uList);
      setAllOrders(oList);
    } catch (err) {
      console.warn('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (userProfile: UserProfile) => {
    const updatedStatus = userProfile.status === 'Suspended' ? 'Active' : 'Suspended';
    const updated = { ...userProfile, status: updatedStatus as any };
    await saveUserProfile(updated);
    setUsers((prev) => prev.map((u) => (u.uid === userProfile.uid ? updated : u)));
  };

  const handleSendDirectNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserForNotice || !noticeTitle.trim() || !noticeMessage.trim()) return;
    setNoticeSending(true);
    try {
      await createNotification({
        targetUserId: targetUserForNotice.uid,
        targetUserEmail: targetUserForNotice.email,
        title: noticeTitle.trim(),
        message: noticeMessage.trim(),
        type: 'Account',
      });
      setNoticeSuccess(true);
      setNoticeTitle('');
      setNoticeMessage('');
      setTimeout(() => {
        setNoticeSuccess(false);
        setTargetUserForNotice(null);
      }, 2000);
    } catch (err) {
      console.error('Error sending direct notification:', err);
    } finally {
      setNoticeSending(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term)) ||
      u.uid.toLowerCase().includes(term)
    );
  });

  const getUserOrders = (uid: string) => allOrders.filter((o) => o.userId === uid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Registered User Management</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor player registrations, manage account statuses, view customer Discord inquiries, and transmit direct notifications.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
          Total Registered: {users.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by username, email, or UID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No registered users found.
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Inquiries</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((u) => {
                  const userOrders = getUserOrders(u.uid);
                  const isSuspended = u.status === 'Suspended';
                  return (
                    <tr key={u.uid} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {u.displayName ? u.displayName[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{u.displayName || 'No Name'}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{u.uid.slice(0, 12)}...</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-300">{u.email}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setViewOrdersUser(u)}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:text-emerald-400"
                        >
                          {userOrders.length} Inquiries
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSuspended
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setTargetUserForNotice(u)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700"
                            title="Send Notification"
                          >
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isSuspended
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-rose-400 hover:bg-rose-500/20'
                            }`}
                            title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {isSuspended ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Direct User Notification Modal */}
      {targetUserForNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Send Notification to {targetUserForNotice.displayName || targetUserForNotice.email}</span>
            </h3>

            {noticeSuccess && (
              <div className="p-3 bg-emerald-500/15 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Notification dispatched to player dashboard!</span>
              </div>
            )}

            <form onSubmit={handleSendDirectNotice} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Node Maintenance Notice"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Message Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Your hardware setup has been initialized on Discord..."
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetUserForNotice(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={noticeSending}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{noticeSending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Inquiries Modal */}
      {viewOrdersUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Orders & Inquiries for {viewOrdersUser.displayName || viewOrdersUser.email}
              </h3>
              <button
                onClick={() => setViewOrdersUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {getUserOrders(viewOrdersUser.uid).length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No plan inquiries recorded for this user.</p>
            ) : (
              <div className="space-y-3">
                {getUserOrders(viewOrdersUser.uid).map((order) => (
                  <div key={order.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{order.planName} ({order.category})</span>
                      <span className="text-emerald-400">{order.planCurrency}{order.planPrice}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      {order.planRam} • {order.planCpu} • {order.planStorage}
                    </p>
                    <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                      <span>Status: {order.status}</span>
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
