import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Layers,
  Search,
  MessageSquare,
  CheckCircle,
  Clock,
  Send,
  ExternalLink,
  ChevronDown,
  Filter,
  Mail,
  Trash2,
  Lock,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react';
import { OrderRequest, SupportTicket } from '../../types';
import {
  fetchOrders,
  fetchTickets,
  subscribeToAllTickets,
  updateOrderStatus,
  addTicketResponse,
  updateTicketStatus,
  permanentlyCloseTicket,
  deleteTicketPermanently,
} from '../../firebase/firestoreService';
import { useAuth } from '../../firebase/authContext';

export const AdminSupportTab: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [subView, setSubView] = useState<'orders' | 'tickets'>('orders');

  const [orders, setOrders] = useState<OrderRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected Ticket for reply
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [ticketToPermanentlyClose, setTicketToPermanentlyClose] = useState<SupportTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [oList, tList] = await Promise.all([fetchOrders(), fetchTickets()]);
      setOrders(oList);
      setTickets(tList);
      if (selectedTicket) {
        const refreshed = tList.find((t) => t.id === selectedTicket.id);
        if (refreshed) setSelectedTicket(refreshed);
      }
    } catch (e) {
      console.warn('Error loading support data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = subscribeToAllTickets((tList) => {
      setTickets(tList);
      setSelectedTicket((prev) => {
        if (!prev) return null;
        const refreshed = tList.find((t) => t.id === prev.id);
        return refreshed || prev;
      });
    });
    return () => unsub();
  }, []);

  const handleStatusChangeOrder = async (orderId: string, newStatus: OrderRequest['status']) => {
    await updateOrderStatus(orderId, newStatus, user?.email || 'Admin');
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    setReplySending(true);
    setActionNotice(null);
    try {
      await addTicketResponse(selectedTicket.id, {
        sender: userProfile?.displayName || user?.email || 'Admin Staff',
        senderRole: 'Admin',
        message: replyText.trim(),
      });
      setReplyText('');
      setActionNotice(`📧 Reply sent & mock email dispatched to ${selectedTicket.userEmail}`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      console.error('Error replying to ticket:', err);
      setActionNotice(`Error: ${err.message || 'Failed to send reply'}`);
    } finally {
      setReplySending(false);
    }
  };

  const handleTicketStatusChange = async (ticketId: string, status: SupportTicket['status']) => {
    await updateTicketStatus(ticketId, status, user?.email || 'Admin');
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handlePermanentlyClose = async () => {
    if (!ticketToPermanentlyClose) return;
    try {
      const tId = ticketToPermanentlyClose.id;
      setTicketToPermanentlyClose(null);
      await permanentlyCloseTicket(tId, user?.email || 'Admin');
      setActionNotice(`🔒 Ticket #${tId} permanently closed. Notification & mock email sent.`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      setActionNotice(`❌ Failed to close ticket: ${err.message || err}`);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleDeleteTicketPermanently = async () => {
    if (!ticketToDelete) return;
    try {
      const idToDelete = ticketToDelete.id;
      setTicketToDelete(null);
      if (selectedTicket?.id === idToDelete) {
        setSelectedTicket(null);
      }
      await deleteTicketPermanently(idToDelete, user?.email || 'Admin');
      setActionNotice(`🗑️ Ticket #${idToDelete} permanently deleted from Firestore database.`);
      setTimeout(() => setActionNotice(null), 5000);
    } catch (err: any) {
      setActionNotice(`❌ Failed to delete ticket: ${err.message || err}`);
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.planName.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
  );

  const filteredTickets = tickets.filter(
    (t) =>
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Support & Discord Inquiries Desk</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit customer plan inquiries logged before Discord checkout, track fulfillment statuses, and respond to support tickets.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSubView('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subView === 'orders'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Plan Inquiries ({orders.length})
          </button>
          <button
            onClick={() => setSubView('tickets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              subView === 'tickets'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Support Tickets ({tickets.length})
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by customer email, plan name, or ticket subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* 1. PLAN INQUIRIES VIEW */}
      {subView === 'orders' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Order ID / Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Selected Plan</th>
                  <th className="py-3 px-4">Pricing</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Discord Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No plan inquiries found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-mono text-white block">{order.id}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-white block">{order.userEmail}</span>
                        <span className="text-[10px] text-slate-500 font-mono">UID: {order.userId.slice(0, 8)}...</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-400 block">{order.planName}</span>
                        <span className="text-[10px] text-slate-400">
                          {order.planRam} • {order.planCpu}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {order.planCurrency}{order.planPrice}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChangeOrder(order.id, e.target.value as any)}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[11px] font-semibold text-white focus:border-amber-500"
                        >
                          <option value="Inquiry Sent">Inquiry Sent</option>
                          <option value="Pending Discord Ticket">Pending Discord Ticket</option>
                          <option value="Active on Discord">Active on Discord</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={order.discordInviteUsed}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#7983f5] hover:underline"
                        >
                          <span>Invite</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. SUPPORT TICKETS VIEW */}
      {subView === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="lg:col-span-1 space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
                No support tickets found.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 shadow-md'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Open'
                            ? 'bg-amber-500/20 text-amber-300'
                            : t.status === 'Resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.status}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm truncate">{t.subject}</h4>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.userName} ({t.userEmail})</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Ticket Thread & Reply Panel */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl min-h-[400px]">
            {!selectedTicket ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs">
                <HelpCircle className="w-8 h-8 mb-2 opacity-50" />
                <span>Select a ticket from the left column to read inquiry thread and reply.</span>
              </div>
            ) : (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  {actionNotice && (
                    <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{actionNotice}</span>
                      </div>
                      <button onClick={() => setActionNotice(null)} className="text-amber-400 hover:text-white font-bold text-xs">✕</button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300">
                          Priority: {selectedTicket.priority}
                        </span>
                        {selectedTicket.isPermanentlyClosed && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Permanently Closed</span>
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        From: <strong className="text-white">{selectedTicket.userName}</strong> ({selectedTicket.userEmail}) • {new Date(selectedTicket.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleTicketStatusChange(selectedTicket.id, e.target.value as any)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-white focus:border-amber-500"
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
                      </select>

                      {!selectedTicket.isPermanentlyClosed && selectedTicket.status !== 'Closed' && (
                        <button
                          type="button"
                          onClick={() => setTicketToPermanentlyClose(selectedTicket)}
                          title="Lock & Permanently Close Ticket"
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 transition-all flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Close Permanently</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setTicketToDelete(selectedTicket)}
                        title="Delete Ticket Document from Firestore"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Initial message */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 mt-4 leading-relaxed">
                    <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Customer Message:</p>
                    {selectedTicket.message}
                  </div>

                  {/* Responses */}
                  {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-56 overflow-y-auto pr-1">
                      <p className="text-[11px] font-bold text-slate-400">Response Thread:</p>
                      {selectedTicket.responses.map((resp) => (
                        <div
                          key={resp.id}
                          className={`p-3 rounded-xl text-xs ${
                            resp.senderRole === 'Admin'
                              ? 'bg-amber-950/20 border border-amber-500/20 text-amber-100 ml-4'
                              : 'bg-slate-950 border border-slate-800 text-slate-300 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                            <span className="flex items-center gap-1">
                              {resp.senderRole === 'Admin' && <Mail className="w-3 h-3 text-amber-400" />}
                              {resp.sender} ({resp.senderRole})
                            </span>
                            <span>{new Date(resp.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p>{resp.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply box or locked state */}
                {selectedTicket.isPermanentlyClosed || selectedTicket.status === 'Closed' ? (
                  <div className="mt-4 p-3 bg-slate-950/90 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>This ticket is permanently closed. Discussion thread is locked.</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type official staff reply to player..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="submit"
                      disabled={replySending}
                      className="px-4 py-2.5 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permanently Close Modal */}
      {ticketToPermanentlyClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <Lock className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Permanently Close Ticket?</h3>
            <p className="text-xs text-slate-400">
              Permanently close ticket <strong className="text-white">#{ticketToPermanentlyClose.id}</strong> ("{ticketToPermanentlyClose.subject}")? This will lock the discussion thread and prevent further replies.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToPermanentlyClose(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePermanentlyClose}
                className="px-4 py-2 text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white rounded-xl transition-all"
              >
                Lock & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanently Delete Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Ticket Document?</h3>
            <p className="text-xs text-slate-400">
              Permanently delete ticket <strong className="text-white">#{ticketToDelete.id}</strong> from Firestore? This action <strong className="text-rose-400">cannot</strong> be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTicketPermanently}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
