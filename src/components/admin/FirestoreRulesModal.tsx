import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, ShieldCheck, AlertCircle, Sparkles, Terminal } from 'lucide-react';
import { firebaseProjectId } from '../../firebase/config';

interface FirestoreRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const PRODUCTION_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isSystemOwner() {
      return isAuthenticated() && (
        request.auth.token.email == "samarthpathak62@gmail.com" ||
        request.auth.token.email == "suniitapathak@gmail.com"
      );
    }

    function isAdmin() {
      return isAuthenticated() && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        isSystemOwner()
      );
    }
    
    // Public website configuration and dynamic content (read-only for guests, write for admins)
    match /websiteSettings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /discordSettings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /plans/{planId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /planCategories/{catId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /features/{featureId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /faqs/{faqId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /reviews/{reviewId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /announcements/{announcementId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /homepageConfig/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /navigation/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /footer/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /socialLinks/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }

    // Admin records and roles
    match /admins/{adminId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin() || (isAuthenticated() && request.auth.uid == adminId && isSystemOwner());
    }

    match /roles/{roleId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Orders / Inquiries
    match /orders/{orderId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Support tickets
    match /tickets/{ticketId} {
      allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
      allow delete: if isAdmin();
    }

    // Notifications
    match /notifications/{notifId} {
      allow read: if isAuthenticated() && (
        resource.data.target == 'all' || 
        resource.data.userId == request.auth.uid || 
        resource.data.targetUserId == request.auth.uid ||
        resource.data.targetUserEmail == request.auth.token.email ||
        isAdmin()
      );
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Activity and Audit logs
    match /activityLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }
  }
}`;

export const DEV_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Quick Testing Mode: Allows authenticated users full read & write access
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`;

export const FirestoreRulesModal: React.FC<FirestoreRulesModalProps> = ({
  isOpen,
  onClose,
  reason,
}) => {
  const [activeTab, setActiveTab] = useState<'production' | 'dev'>('production');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentRules = activeTab === 'production' ? PRODUCTION_FIRESTORE_RULES : DEV_FIRESTORE_RULES;
  const consoleUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/firestore/rules`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentRules);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="firestore-rules-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="firestore-rules-modal-card"
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Firebase Firestore Security Rules</h3>
              <p className="text-[11px] text-slate-400">
                Project: <span className="text-amber-400 font-mono font-semibold">{firebaseProjectId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {reason && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Permission Requirement Detected:</span>
                <span className="text-slate-300 text-[11px] mt-0.5 block leading-relaxed">{reason}</span>
              </div>
            </div>
          )}

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              How to Publish Rules in Firebase Console (Under 15 Seconds)
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
              <li>
                Click <strong className="text-white">"Copy Rules"</strong> below to grab the configured rules.
              </li>
              <li>
                Click <strong className="text-amber-400">"Open Firebase Rules Editor ↗"</strong> to open your project rules tab.
              </li>
              <li>
                Select all existing text in the editor, paste the copied rules, and click <strong className="text-blue-400">Publish</strong>.
              </li>
            </ol>
          </div>

          {/* Rule Type Selector */}
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('production')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'production'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Production Rules (Recommended)
              </button>
              <button
                onClick={() => setActiveTab('dev')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'dev'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Quick Testing Mode
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Rules'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-[11px]">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>firestore.rules</span>
              </div>
              <span>{activeTab === 'production' ? 'Multi-role & Owner Authorized' : 'Authenticated Full Access'}</span>
            </div>
            <pre className="p-4 text-slate-300 overflow-x-auto max-h-60 leading-relaxed select-all">
              {currentRules}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Rules'}</span>
            </button>
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span>Open Firebase Rules Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
