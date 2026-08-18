import { useState, FormEvent, MouseEvent, useEffect } from 'react';
import { UserSession, AccountSummary } from '../types';
import { getAllAccounts, removeAccount, normalizeEmail } from '../utils/storage';
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  Lock,
  CheckCircle2,
  Award,
  Users,
  Trash2,
  User,
} from 'lucide-react';

interface AuthScreenProps {
  onLogin: (session: UserSession) => void;
  defaultEmail?: string;
}

export function AuthScreen({ onLogin, defaultEmail = '' }: AuthScreenProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [savedAccounts, setSavedAccounts] = useState<AccountSummary[]>([]);

  useEffect(() => {
    setSavedAccounts(getAllAccounts());
  }, []);

  const handleLoginWithEmail = (targetEmail: string, customName?: string) => {
    const cleanEmail = normalizeEmail(targetEmail);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      // Derive clean display name from custom name or email
      let displayName = customName?.trim();
      if (!displayName) {
        const rawName = cleanEmail.split('@')[0];
        displayName = rawName
          .split(/[._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');
      }

      onLogin({
        email: cleanEmail,
        name: displayName,
        loginAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=0284c7,1e3a8a,047857`,
      });
      setIsSubmitting(false);
    }, 250);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLoginWithEmail(email, fullName);
  };

  const handleDeleteAccountData = (e: MouseEvent, targetEmail: string) => {
    e.stopPropagation();
    if (window.confirm(`Remove saved workspace data for ${targetEmail}?`)) {
      removeAccount(targetEmail);
      setSavedAccounts(getAllAccounts());
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Soft Gradients */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* Emblem */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/80 p-1 mb-4">
          <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
            <Award className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-serif">
          AI-Workshop Submission portal
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
          Document Submission & Official Completion Certificate Portal
        </p>

        {/* Multi-user Isolation Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>User Authentication & Workspace Access</span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 space-y-4">
        {/* Saved Accounts on this Device (if any) */}
        {savedAccounts.length > 0 && (
          <div className="bg-white border border-slate-200/90 py-5 px-6 shadow-md rounded-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-600" />
                Previous Workspaces ({savedAccounts.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Select to Open</span>
            </div>

            <div className="space-y-2">
              {savedAccounts.map((acc) => (
                <div
                  key={acc.email}
                  onClick={() => handleLoginWithEmail(acc.email, acc.name)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {acc.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 group-hover:text-sky-900 truncate">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{acc.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                        {acc.uploadedCount}/9 Modules
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAccountData(e, acc.email)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Delete account data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white border border-slate-200/90 py-8 px-6 sm:px-10 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Sign In With Your Email
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 font-mono flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              User Login
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="user-email-id"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Your Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="user-email-id"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="e.g. yourname@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="user-fullname-id"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Your Full Name (For Certificate)
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="user-fullname-id"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white focus:border-transparent transition"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Sign in with your email to submit documents and generate certificates under your name.
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                {errorMessage}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                id="login-submit-btn"
                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Opening Workspace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Workspace
                    <ArrowRight className="w-4 h-4 text-sky-400" />
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" />
              Direct User Login
            </span>
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              9 Mandatory Workshop Modules
            </span>
          </div>
        </div>

        {/* 9 Headings preview box */}
        <div className="p-4 bg-white/80 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-600">
          <p className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            9 Required Statutory Modules:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] text-slate-600 pt-1">
            <span>• Court Order Gist</span>
            <span>• G.O. Summary</span>
            <span>• Translation</span>
            <span>• Inspection Report</span>
            <span>• Letter Drafting</span>
            <span>• Action Point Extraction</span>
            <span>• Review Data Analysis</span>
            <span>• PPT Creation Template</span>
            <span>• Inspection Checklist</span>
          </div>
        </div>
      </div>
    </div>
  );
}
