import React, { useState, useEffect } from 'react';
import { MessageSquare, Save, CheckCircle, ExternalLink, Sparkles, Users } from 'lucide-react';
import { useSettings } from '../../firebase/settingsContext';
import { useAuth } from '../../firebase/authContext';

export const AdminDiscordSettingsTab: React.FC = () => {
  const { discordSettings, updateDiscordSettings } = useSettings();
  const { user } = useAuth();

  const [mainInviteUrl, setMainInviteUrl] = useState(discordSettings.mainInviteUrl || '');
  const [supportInviteUrl, setSupportInviteUrl] = useState(discordSettings.supportInviteUrl || '');
  const [orderInviteUrl, setOrderInviteUrl] = useState(discordSettings.orderInviteUrl || '');
  const [buttonText, setButtonText] = useState(discordSettings.buttonText || 'Join Discord');
  const [serverName, setServerName] = useState(discordSettings.serverName || 'NovaCraft Official Discord');
  const [description, setDescription] = useState(discordSettings.description || '');
  const [memberCountEstimate, setMemberCountEstimate] = useState(discordSettings.memberCountEstimate || '18,400+ Members');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMainInviteUrl(discordSettings.mainInviteUrl || '');
    setSupportInviteUrl(discordSettings.supportInviteUrl || '');
    setOrderInviteUrl(discordSettings.orderInviteUrl || '');
    setButtonText(discordSettings.buttonText || 'Join Discord');
    setServerName(discordSettings.serverName || 'NovaCraft Official Discord');
    setDescription(discordSettings.description || '');
    setMemberCountEstimate(discordSettings.memberCountEstimate || '18,400+ Members');
  }, [discordSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDiscordSettings({
        mainInviteUrl: mainInviteUrl.trim(),
        supportInviteUrl: supportInviteUrl.trim(),
        orderInviteUrl: orderInviteUrl.trim(),
        buttonText: buttonText.trim(),
        serverName: serverName.trim(),
        description: description.trim(),
        memberCountEstimate: memberCountEstimate.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Error updating Discord settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Discord Central Routing Settings</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your official Discord server invites and default CTA button text across the entire website.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 shadow-lg">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold">Discord Routing Successfully Updated</p>
            <p className="text-[11px] text-emerald-400/80 mt-0.5">
              All "Buy Plan", "Order Now", and Discord navigation buttons are now pointing to the new destination.
            </p>
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-[#5865F2]/20 border border-[#5865F2]/40 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shadow-lg">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Live Public Preview
              </span>
              <h3 className="text-base font-bold text-white">{serverName || 'Official Discord'}</h3>
              <p className="text-xs text-emerald-400">{memberCountEstimate || '18,400+ Members'}</p>
            </div>
          </div>

          <a
            href={mainInviteUrl || 'https://discord.gg'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all shadow-md"
          >
            <span>{buttonText || 'Join Discord'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <MessageSquare className="w-4 h-4 text-[#7983f5]" />
            <h3 className="text-sm font-bold text-white">Discord Invites & Endpoints</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Primary / Main Discord Invite URL *
              </label>
              <input
                type="url"
                required
                value={mainInviteUrl}
                onChange={(e) => setMainInviteUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-[#5865F2]"
                placeholder="https://discord.gg/novacraft"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Default redirect used across navbar, footer, and hero buttons.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Order Desk Discord Invite URL *
              </label>
              <input
                type="url"
                required
                value={orderInviteUrl}
                onChange={(e) => setOrderInviteUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-[#5865F2]"
                placeholder="https://discord.gg/novacraft-orders"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Destination when buyers click "Buy Plan on Discord" in plan cards.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Support Discord Invite URL
              </label>
              <input
                type="url"
                value={supportInviteUrl}
                onChange={(e) => setSupportInviteUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-[#5865F2]"
                placeholder="https://discord.gg/novacraft-support"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Dedicated invite for customer support and ticket assistance.
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Default Discord Button Text
              </label>
              <input
                type="text"
                required
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-[#5865F2]"
                placeholder="Join Discord"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Discord Community Display Name
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="NovaCraft Official Community"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Estimated Member Count Badge
              </label>
              <input
                type="text"
                value={memberCountEstimate}
                onChange={(e) => setMemberCountEstimate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                placeholder="18,400+ Discord Members"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Community Onboarding Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
              placeholder="Join our official Discord community for 24/7 staff ticket support, server giveaways..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-xl shadow-[#5865F2]/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save Discord Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
