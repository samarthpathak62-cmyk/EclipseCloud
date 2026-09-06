import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Cpu,
  HardDrive,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { HostingPlan } from '../types';
import { useSettings } from '../firebase/settingsContext';
import { useAuth } from '../firebase/authContext';
import { recordPlanOrderInquiry } from '../firebase/firestoreService';

interface DiscordOrderModalProps {
  plan: HostingPlan | null;
  onClose: () => void;
  onOrderLogged?: () => void;
}

export const DiscordOrderModal: React.FC<DiscordOrderModalProps> = ({
  plan,
  onClose,
  onOrderLogged,
}) => {
  const { discordSettings, websiteSettings } = useSettings();
  const { user, userProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'logging' | 'ready'>('idle');

  if (!plan) return null;

  const targetDiscordUrl =
    plan.discordDestination || discordSettings.orderInviteUrl || discordSettings.mainInviteUrl;

  const orderSnippet = `Order Inquiry: ${plan.name} | Category: ${plan.category} | RAM: ${plan.ram} | CPU: ${plan.cpu} | Storage: ${plan.storage} | Price: ${plan.currency}${plan.price}${plan.billingPeriod}`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(orderSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleProceedToDiscord = async () => {
    setInquiryStatus('logging');
    try {
      // Record inquiry in Firestore for tracking in User Dashboard and Admin Panel
      await recordPlanOrderInquiry({
        userId: user?.uid || 'guest',
        userEmail: user?.email || 'Guest Visitor',
        userName: userProfile?.displayName || user?.displayName || 'Prospective Customer',
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.price,
        planCurrency: plan.currency,
        planRam: plan.ram,
        planCpu: plan.cpu,
        planStorage: plan.storage,
        category: plan.category,
        status: 'Inquiry Sent',
        notes: `User initiated order inquiry for ${plan.name}`,
        discordInviteUsed: targetDiscordUrl,
      });

      if (onOrderLogged) {
        onOrderLogged();
      }
    } catch (e) {
      console.warn('Inquiry logging error:', e);
    } finally {
      setInquiryStatus('ready');
      // Open Discord destination
      window.open(targetDiscordUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div
      id="discord-order-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="discord-order-modal-card"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl shadow-emerald-950/40 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#7983f5]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Discord Order System</h3>
              <p className="text-xs text-slate-400">Direct Human Deployment & Consultation</p>
            </div>
          </div>
          <button
            id="close-order-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Selected Plan Summary Banner */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Selected Hardware Node
                </span>
                <h4 className="text-xl font-extrabold text-white mt-0.5">{plan.name}</h4>
                <p className="text-xs text-slate-400">{plan.category}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-400">
                  {plan.currency}{plan.price}
                </span>
                <span className="text-xs text-slate-400 block">{plan.billingPeriod}</span>
              </div>
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold">{plan.ram}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-semibold">{plan.cpu}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold">{plan.storage}</span>
              </div>
            </div>
          </div>

          {/* Honest Discord Explanation */}
          <div className="bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <ShieldCheck className="w-4 h-4 text-[#7983f5]" />
              <span>How Ordering Works</span>
            </div>
            <p>
              To give you tailored hardware allocation, custom subdomain assignment, and zero-compromise modpack setups, all orders at <strong className="text-white">{websiteSettings.websiteName}</strong> are processed directly through our Official Discord community.
            </p>
            <p className="text-slate-400">
              No automated surprise billing. Our deployment team opens a dedicated channel to assist your server configuration directly.
            </p>
          </div>

          {/* Copy Order Specs Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Ticket Order Summary:</span>
              <button
                id="copy-order-snippet-btn"
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono break-all selection:bg-emerald-500">
              {orderSnippet}
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Button */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            id="order-modal-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            id="order-modal-proceed-discord-btn"
            onClick={handleProceedToDiscord}
            disabled={inquiryStatus === 'logging'}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-lg shadow-[#5865F2]/25 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Proceed to Discord Order Channel</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
