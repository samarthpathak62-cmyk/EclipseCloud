import React, { useEffect, useState } from 'react';
import { FileText, Search, Activity, Shield, Clock, Filter } from 'lucide-react';
import { ActivityLog, AuditLog } from '../../types';
import { fetchActivityLogs, fetchAuditLogs } from '../../firebase/firestoreService';

export const AdminLogsTab: React.FC = () => {
  const [logType, setLogType] = useState<'activity' | 'audit'>('activity');
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const [act, aud] = await Promise.all([
          fetchActivityLogs(100),
          fetchAuditLogs(100),
        ]);
        setActivityLogs(act);
        setAuditLogs(aud);
      } catch (err) {
        console.warn('Error loading logs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const filteredActivities = activityLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAudits = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.targetCollection.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.targetDocId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Security Activity & Audit Logs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable tracking of administrative actions, plan modifications, configuration updates, and security events.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setLogType('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              logType === 'activity'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Activity Stream ({activityLogs.length})
          </button>
          <button
            onClick={() => setLogType('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              logType === 'audit'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Changes ({auditLogs.length})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter logs by actor, action, or document ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : logType === 'activity' ? (
        /* Activity Stream Table */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredActivities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No activity logs match filter.
                    </td>
                  </tr>
                ) : (
                  filteredActivities.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {log.actorEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-400">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-400">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Log Table */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Collection</th>
                  <th className="py-3 px-4">Document ID</th>
                  <th className="py-3 px-4">Mutation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No audit changes match filter.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((aud) => (
                    <tr key={aud.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(aud.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                        {aud.actorEmail}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-cyan-400">
                          {aud.targetCollection}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {aud.targetDocId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-amber-400">
                        {aud.action}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
