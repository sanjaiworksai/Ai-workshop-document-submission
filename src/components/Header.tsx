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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-slate-900 tracking-tight font-serif">
                  AI-Workshop Submission portal
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-mono">
                  Isolated Workspace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                {user.organization || 'Administrative & Legal Compliance Directorate'}
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs">
            <button
              onClick={() => onStepChange('upload')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition cursor-pointer ${
                currentStep === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Upload Documents ({uploadedCount}/{totalCount})</span>
            </button>

            <button
              onClick={() => onStepChange('participants')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition cursor-pointer ${
                currentStep === 'participants'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>2. Participant Details</span>
            </button>

            <button
              onClick={() => onStepChange('certificate')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition cursor-pointer ${
                currentStep === 'certificate'
                  ? 'bg-slate-900 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Certificate Download</span>
            </button>
          </div>

          {/* User Profile & Workspace Switcher */}
          <div className="relative">
            <div
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 transition cursor-pointer border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs">
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
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
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
                      className="w-full text-left px-3 py-2 rounded-xl text-sky-700 hover:bg-sky-50 font-semibold flex items-center gap-2 transition cursor-pointer"
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
