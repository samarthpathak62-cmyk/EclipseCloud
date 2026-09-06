import React, { useEffect, useState } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  UserCheck,
  Lock,
} from 'lucide-react';
import { AdminUser, AdminRole } from '../../types';
import { fetchAdmins, saveAdminDoc, deleteAdminDoc } from '../../firebase/firestoreService';
import { useAuth, ALL_PERMISSIONS } from '../../firebase/authContext';

export const AdminRolesTab: React.FC = () => {
  const { user: currentAuthUser, isOwner, adminRole: currentRole } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<AdminRole>('Admin');
  const [permissions, setPermissions] = useState<string[]>([]);

  const defaultRolePermissions: Record<AdminRole, string[]> = {
    Owner: [...ALL_PERMISSIONS],
    'Super Admin': [...ALL_PERMISSIONS],
    Admin: ALL_PERMISSIONS.filter((p) => p !== 'Manage Admins' && p !== 'Manage Roles'),
    Moderator: [
      'View Dashboard',
      'Manage FAQ',
      'Manage Reviews',
      'Manage Announcements',
      'Manage Support',
      'View Logs',
    ],
    Support: ['View Dashboard', 'Manage Support', 'View Logs'],
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchAdmins();
      setAdmins(list);
    } catch (e) {
      console.warn('Error fetching admins:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAdmin(null);
    setEmail('');
    setDisplayName('');
    setRole('Admin');
    setPermissions(defaultRolePermissions['Admin']);
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEmail(admin.email);
    setDisplayName(admin.displayName || '');
    setRole(admin.role);
    setPermissions(admin.permissions || defaultRolePermissions[admin.role]);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: AdminRole) => {
    setRole(newRole);
    setPermissions(defaultRolePermissions[newRole]);
  };

  const togglePermission = (perm: string) => {
    if (role === 'Owner') return; // Owner always has all permissions
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSaving(true);
    try {
      const adminToSave: AdminUser = {
        uid: editingAdmin?.uid || `admin-${Date.now()}`,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || email.split('@')[0],
        role,
        permissions: role === 'Owner' ? [...ALL_PERMISSIONS] : permissions,
        assignedBy: currentAuthUser?.email || 'System',
        assignedAt: editingAdmin?.assignedAt || new Date().toISOString(),
      };

      await saveAdminDoc(adminToSave, currentAuthUser?.email || 'Admin');
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error('Error saving staff member:', err);
      setActionError('Error saving staff member: ' + (err?.message || 'Permission denied'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: AdminUser) => {
    setActionError(null);
    if (admin.role === 'Owner' && !isOwner) {
      setActionError('Only an existing Owner can remove the Owner account.');
      setDeleteConfirm(null);
      return;
    }
    await deleteAdminDoc(admin.uid, currentAuthUser?.email || 'Admin');
    setDeleteConfirm(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Staff Roles & Permissions</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage administrative access with role-based permissions (RBAC) across Owner, Super Admin, Admin, Moderator, and Support tiers.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No admin records found.
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Permissions Active</th>
                  <th className="py-3 px-4">Assigned By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {admins.map((adm) => {
                  const isOwnerAccount = adm.role === 'Owner';
                  return (
                    <tr key={adm.uid} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isOwnerAccount
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {adm.displayName || adm.email}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">{adm.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adm.role === 'Owner'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : adm.role === 'Super Admin'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : adm.role === 'Admin'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {adm.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-mono text-slate-400">
                          {adm.role === 'Owner' ? 'ALL (Full Access)' : `${adm.permissions?.length || 0} permissions`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-500">
                        {adm.assignedBy || 'System'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => openEditModal(adm)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                            title="Edit Role & Permissions"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {(!isOwnerAccount || isOwner) && (
                            <button
                              onClick={() => setDeleteConfirm(adm)}
                              className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-500/20"
                              title="Revoke Admin"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Admin Role Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-xl w-full space-y-4 my-8 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>{editingAdmin ? `Edit Staff Member` : 'Assign New Staff Member'}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    placeholder="staff@domain.com"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                    placeholder="e.g. Lead Moderator Alex"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Role Tier *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-amber-500"
                >
                  <option value="Owner">Owner (All Permissions Unrestricted)</option>
                  <option value="Super Admin">Super Admin (Full Administrative Operations)</option>
                  <option value="Admin">Admin (Plans, CMS, Settings & Users)</option>
                  <option value="Moderator">Moderator (CMS, Reviews, FAQ, Support)</option>
                  <option value="Support">Support (Inquiries & Activity Logs)</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-300 font-semibold">Granular Permission Matrix</label>
                  {role === 'Owner' && (
                    <span className="text-[10px] text-amber-400 font-bold">
                      Locked for Owner Tier
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = role === 'Owner' || permissions.includes(perm);
                    return (
                      <label
                        key={perm}
                        className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isChecked ? 'bg-slate-900 text-white' : 'text-slate-500'
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={role === 'Owner'}
                          checked={isChecked}
                          onChange={() => togglePermission(perm)}
                          className="rounded border-slate-700 text-amber-500"
                        />
                        <span className="text-[11px] font-medium">{perm}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50 transition-opacity"
                >
                  {saving ? 'Saving...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Revoke Staff Access?</h3>
            <p className="text-xs text-slate-400">
              Revoke administrative privileges for <strong className="text-white">{deleteConfirm.email}</strong> ({deleteConfirm.role})?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-xs font-bold bg-rose-500 text-white rounded-xl"
              >
                Revoke Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
