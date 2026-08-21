import { useState } from 'react';
import { UserSession } from '../types';
import {
  Award,
  LogOut,
  FileText,
  Users,
  Download,
  ShieldCheck,
  ChevronDown,
  UserPlus,
  Lock,
} from 'lucide-react';

interface HeaderProps {
  user: UserSession;
  currentStep: 'upload' | 'participants' | 'certificate';
  onStepChange: (step: 'upload' | 'participants' | 'certificate') => void;
  uploadedCount: number;
  totalCount: number;
  onLogout: () => void;
  onSwitchUser?: (email: string) => void;
}

export function Header({
  user,
  currentStep,
  onStepChange,
  uploadedCount,
  totalCount,
  onLogout,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/95 border-b border-slate-200/90 sticky top-0 z-30 shadow-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight font-serif">
                  AI-Workshop Submission portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                {user.organization || 'AI Workshop Program'}
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => onStepChange('upload')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition cursor-pointer ${
                currentStep === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>1. Upload Documents ({uploadedCount}/{totalCount})</span>
            </button>

            <button
              onClick={() => {
                if (uploadedCount === totalCount) {
                  onStepChange('participants');
                }
              }}
              disabled={uploadedCount < totalCount}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                uploadedCount < totalCount
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : currentStep === 'participants'
                  ? 'bg-white text-slate-900 shadow-xs font-bold cursor-pointer border border-slate-200/70'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
              title={
                uploadedCount < totalCount
                  ? `Upload all ${totalCount} statutory documents to unlock (${uploadedCount}/${totalCount} submitted)`
                  : 'Go to Participant Details'
              }
            >
              {uploadedCount < totalCount ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : (
                <Users className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>2. Participant Details</span>
            </button>

            <button
              onClick={() => {
                if (uploadedCount === totalCount) {
                  onStepChange('certificate');
                }
              }}
              disabled={uploadedCount < totalCount}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                uploadedCount < totalCount
                  ? 'text-slate-400 cursor-not-allowed opacity-60'
                  : currentStep === 'certificate'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-bold cursor-pointer'
                  : 'text-slate-600 hover:text-slate-900 cursor-pointer'
              }`}
              title={
                uploadedCount < totalCount
                  ? `Upload all ${totalCount} statutory documents to unlock (${uploadedCount}/${totalCount} submitted)`
                  : 'Go to Certificate Download'
              }
            >
              {uploadedCount < totalCount ? (
                <Lock className="w-3 h-3 text-slate-400" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>3. Certificate Download</span>
            </button>
          </div>

          {/* User Profile & Workspace Switcher */}
          <div className="relative">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shadow-xs">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name.charAt(0)
                )}
              </div>

              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-slate-500 truncate max-w-[130px] font-mono">
                  {user.email}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-fade-in text-xs">
                  {/* Current Active Account Header */}
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Active Workspace
                    </span>
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Data strictly isolated to this Gmail</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 px-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Sign In with Another Email ID
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
