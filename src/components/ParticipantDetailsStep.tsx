import { useState, useEffect, FormEvent } from 'react';
import { Participant, CertificateTheme, DocumentCategoryId, UploadedDocument } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import {
  Users,
  User,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Layers,
  FileCheck,
  Award,
  Calendar,
  Hash,
  Check,
  AlertCircle,
} from 'lucide-react';

interface ParticipantDetailsStepProps {
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  defaultEmail: string;
  defaultName: string;
  defaultDepartment?: string;
  defaultDesignation?: string;
  defaultOrganization?: string;
  theme: CertificateTheme;
  onThemeChange: (theme: CertificateTheme) => void;
  customEmblemUrl?: string;
  onCustomEmblemUrlChange?: (url: string) => void;
  mode: 'individual' | 'group';
  onModeChange: (mode: 'individual' | 'group') => void;
  singleParticipant: Participant;
  onUpdateSingleParticipant: (p: Participant) => void;
  groupParticipants: Participant[];
  onUpdateGroupParticipants: (list: Participant[]) => void;
  signatory1Name: string;
  onSignatory1NameChange: (val: string) => void;
  signatory1Title: string;
  onSignatory1TitleChange: (val: string) => void;
  signatory2Name: string;
  onSignatory2NameChange: (val: string) => void;
  signatory2Title: string;
  onSignatory2TitleChange: (val: string) => void;
  organizationName: string;
  onOrganizationNameChange: (val: string) => void;
  onBackToUpload: () => void;
  onProceedToDownload: () => void;
}

export function ParticipantDetailsStep({
  documents,
  defaultEmail,
  defaultName,
  theme,
  onThemeChange,
  customEmblemUrl,
  onCustomEmblemUrlChange,
  mode,
  onModeChange,
  singleParticipant,
  onUpdateSingleParticipant,
  groupParticipants,
  onUpdateGroupParticipants,
  signatory1Name,
  onSignatory1NameChange,
  signatory1Title,
  onSignatory1TitleChange,
  signatory2Name,
  onSignatory2NameChange,
  signatory2Title,
  onSignatory2TitleChange,
  organizationName,
  onOrganizationNameChange,
  onBackToUpload,
  onProceedToDownload,
}: ParticipantDetailsStepProps) {
  // New single member form for group
  const [newName, setNewName] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newEmail, setNewEmail] = useState('');

  // Bulk paste modal / toggle
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkNamesText, setBulkNamesText] = useState('');

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = DOCUMENT_CATEGORIES.length;

  const todayFormattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Ensure singleParticipant always has auto-generated certificate number and issue date
  useEffect(() => {
    let updated = false;
    const next = { ...singleParticipant };

    if (!next.issueDate) {
      next.issueDate = todayFormattedDate;
      updated = true;
    }

    if (!next.certificateNumber) {
      const emailPrefix = defaultEmail ? defaultEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) : 'ADM';
      next.certificateNumber = `CERT-${emailPrefix || 'ADM'}-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      updated = true;
    }

    if (updated) {
      onUpdateSingleParticipant(next);
    }
  }, [singleParticipant, defaultEmail, todayFormattedDate, onUpdateSingleParticipant]);

  const handleAddGroupMember = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const count = groupParticipants.length + 1;
    const emailPrefix = defaultEmail ? defaultEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) : 'GRP';
    const newP: Participant = {
      id: `grp-${Date.now()}`,
      fullName: newName.trim(),
      email: newEmail.trim() || undefined,
      designation: newDesignation.trim() || 'Officer / Member',
      department: newDepartment.trim() || singleParticipant.department,
      organization: organizationName,
      certificateNumber: `CERT-${emailPrefix}-2026-${String(count).padStart(3, '0')}`,
      issueDate: todayFormattedDate,
      verificationCode: `VERIF-GRP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    };

    onUpdateGroupParticipants([...groupParticipants, newP]);
    setNewName('');
    setNewDesignation('');
    setNewDepartment('');
    setNewEmail('');
  };

  const handleRemoveMember = (id: string) => {
    onUpdateGroupParticipants(groupParticipants.filter((p) => p.id !== id));
  };

  const handleBulkImport = () => {
    if (!bulkNamesText.trim()) return;

    const lines = bulkNamesText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const startIndex = groupParticipants.length;
    const emailPrefix = defaultEmail ? defaultEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) : 'GRP';
    const imported: Participant[] = lines.map((name, i) => {
      const idx = startIndex + i + 1;
      return {
        id: `grp-bulk-${Date.now()}-${i}`,
        fullName: name,
        designation: 'Officer / Participant',
        department: singleParticipant.department,
        organization: organizationName,
        certificateNumber: `CERT-${emailPrefix}-2026-${String(idx).padStart(3, '0')}`,
        issueDate: todayFormattedDate,
        verificationCode: `VERIF-GRP-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      };
    });

    onUpdateGroupParticipants([...groupParticipants, ...imported]);
    setBulkNamesText('');
    setIsBulkOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Warning Banner if Not All Documents Uploaded */}
      {uploadedCount < totalCount && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-sm">Incomplete Module Submissions ({uploadedCount}/{totalCount} Documents Uploaded)</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Statutory certificate generation requires uploading all {totalCount} workshop module documents. Please return to Step 1 to submit the remaining {totalCount - uploadedCount} documents.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToUpload}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go to Document Upload</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3.5">
              <Users className="w-4 h-4 text-indigo-600" />
              Step 2 of 3: Participant Details
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
              Participant Information & Roster
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Enter recipient candidate information. Choose between single individual certification or a group roster for multiple participants.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs flex items-center gap-3 shadow-xs">
              <FileCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="font-bold text-slate-800">Modules Submitted</p>
                <p className="text-[11px] text-slate-500 font-mono">{uploadedCount} of {totalCount} Modules</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Individual vs Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => onModeChange('individual')}
          id="mode-individual-card"
          className={`p-6 rounded-3xl border-2 transition cursor-pointer flex items-start gap-4 ${
            mode === 'individual'
              ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              mode === 'individual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <User className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Individual Certificate
              </h2>
              {mode === 'individual' && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Generate a single customized official certificate of compliance for one specific candidate.
            </p>
          </div>
        </div>

        <div
          onClick={() => onModeChange('group')}
          id="mode-group-card"
          className={`p-6 rounded-3xl border-2 transition cursor-pointer flex items-start gap-4 ${
            mode === 'group'
              ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-500/20'
              : 'bg-white/80 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              mode === 'group'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                Group Certificate Roster
              </h2>
              {mode === 'group' && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-0.5 rounded-full">
                  {groupParticipants.length} Participants
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Add multiple members. Each participant receives an individual certificate with unique serial numbers.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {mode === 'individual' ? (
          /* Individual Candidate Form */
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div className="flex items-center space-x-2.5">
                <User className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Candidate Information
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
                {singleParticipant.certificateNumber}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Candidate Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="participant-fullname-input"
                  value={singleParticipant.fullName}
                  onChange={(e) =>
                    onUpdateSingleParticipant({ ...singleParticipant, fullName: e.target.value })
                  }
                  placeholder="e.g. Sanjai Kumar"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Designation / Title
                </label>
                <input
                  type="text"
                  id="participant-designation-input"
                  value={singleParticipant.designation}
                  onChange={(e) =>
                    onUpdateSingleParticipant({ ...singleParticipant, designation: e.target.value })
                  }
                  placeholder="e.g. Senior Nodal Officer"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Department / Division
                </label>
                <input
                  type="text"
                  id="participant-dept-input"
                  value={singleParticipant.department}
                  onChange={(e) =>
                    onUpdateSingleParticipant({ ...singleParticipant, department: e.target.value })
                  }
                  placeholder="e.g. Legal & Administrative Wing"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition placeholder:text-slate-400"
                />
              </div>

              {/* Auto-Generated System Metadata (Read-only, prepared automatically) */}
              <div className="sm:col-span-2 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shrink-0">
                      <Hash className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Certificate Serial ID
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded-md">
                          <Check className="w-2.5 h-2.5" /> Auto-Prepared
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-slate-900 mt-1">
                        {singleParticipant.certificateNumber || 'CERT-2026-AUTO'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Official Issue Date
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold rounded-md">
                          <Check className="w-2.5 h-2.5" /> System Timestamp
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">
                        {singleParticipant.issueDate || todayFormattedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Group Mode: Roster Management */
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Add New Member Box */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center space-x-2.5">
                  <Plus className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Add Participant to Group Roster
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(!isBulkOpen)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  {isBulkOpen ? 'Close Bulk Paste' : 'Bulk Paste Names'}
                </button>
              </div>

              {isBulkOpen ? (
                <div className="space-y-3 bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200 mb-5">
                  <label className="block text-xs font-semibold text-indigo-950">
                    Paste multiple candidate names (one per line or comma-separated):
                  </label>
                  <textarea
                    rows={4}
                    value={bulkNamesText}
                    onChange={(e) => setBulkNamesText(e.target.value)}
                    placeholder="Dr. S. Radhakrishnan&#10;Adv. Meenakshi Sundaram&#10;Karthik Narayanan&#10;Pooja Venkatesh"
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBulkOpen(false)}
                      className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkImport}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl cursor-pointer shadow-xs"
                    >
                      Import All to Roster
                    </button>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleAddGroupMember} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Anandha Krishnan"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={newDesignation}
                    onChange={(e) => setNewDesignation(e.target.value)}
                    placeholder="e.g. Legal Auditor"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="e.g. Judicial Wing"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="candidate@gmail.com"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none placeholder:text-slate-400"
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Roster
                  </button>
                </div>
              </form>
            </div>

            {/* Roster List Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2.5">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Current Participant Roster ({groupParticipants.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  Each member receives an individual certificate
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {groupParticipants.map((p, idx) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between gap-3 group">
                    <div className="flex items-center space-x-3.5">
                      <span className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-indigo-700 flex items-center justify-center text-xs font-mono font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.fullName}</p>
                        <p className="text-[11px] text-slate-500">
                          {p.designation} • {p.department}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="hidden sm:inline-block font-mono text-[10px] bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 font-bold">
                        {p.certificateNumber}
                      </span>
                      {groupParticipants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(p.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                          title="Remove candidate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToUpload}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to Document Upload</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            id="proceed-to-download-btn"
            onClick={onProceedToDownload}
            disabled={uploadedCount < totalCount}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
              uploadedCount === totalCount
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
            title={
              uploadedCount === totalCount
                ? 'Generate official certificates'
                : `Upload all ${totalCount} module documents in Step 1 first (${uploadedCount}/${totalCount} submitted)`
            }
          >
            <span>Generate & Proceed to Certificate Download</span>
            <ArrowRight className={`w-4 h-4 ${uploadedCount === totalCount ? 'text-amber-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
