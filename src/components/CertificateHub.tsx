import { useState, useRef, ChangeEvent } from 'react';
import { Participant, CertificateTheme, DocumentCategoryId, UploadedDocument } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import {
  downloadSingleCertificate,
  downloadGroupCertificatesBundle,
} from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import { OfficialSeal } from './OfficialSeal';
import { TAMIL_NADU_EMBLEM_BASE64 } from '../assets/tamilNaduEmblemBase64';
import {
  Award,
  Download,
  Users,
  User,
  CheckCircle2,
  Printer,
  Sparkles,
  QrCode,
  ShieldCheck,
  ArrowLeft,
  FileCheck,
  Building,
  Briefcase,
  FileText,
  ExternalLink,
  AlertCircle,
  UploadCloud,
  ImageIcon,
  RotateCcw,
  Camera,
} from 'lucide-react';

interface CertificateHubProps {
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  theme: CertificateTheme;
  mode: 'individual' | 'group';
  singleParticipant: Participant;
  groupParticipants: Participant[];
  customEmblemUrl?: string;
  onCustomEmblemUrlChange?: (url: string) => void;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  organizationName: string;
  onBackToParticipants: () => void;
}

export function CertificateHub({
  documents,
  theme,
  mode,
  singleParticipant,
  groupParticipants,
  customEmblemUrl,
  onCustomEmblemUrlChange,
  signatory1Name,
  signatory1Title,
  signatory2Name,
  signatory2Title,
  organizationName,
  onBackToParticipants,
}: CertificateHubProps) {
  // Selected participant for preview
  const [selectedGroupPreviewIndex, setSelectedGroupPreviewIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');
  const [isDraggingEmblem, setIsDraggingEmblem] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedEmblem = customEmblemUrl || TAMIL_NADU_EMBLEM_BASE64;
  const isCustomEmblemActive = Boolean(customEmblemUrl && customEmblemUrl.trim().length > 0);

  const activeParticipant: Participant =
    mode === 'individual'
      ? singleParticipant
      : groupParticipants[selectedGroupPreviewIndex] || groupParticipants[0] || singleParticipant;

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = DOCUMENT_CATEGORIES.length;

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, JPEG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result && onCustomEmblemUrlChange) {
        onCustomEmblemUrlChange(result);
        setDownloadSuccessMessage('Top certificate image updated successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
    // reset input
    if (e.target) e.target.value = '';
  };

  const handleResetEmblem = () => {
    if (onCustomEmblemUrlChange) {
      onCustomEmblemUrlChange('');
      setDownloadSuccessMessage('Reset to default Tamil Nadu State Emblem.');
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleDownloadSingle = (p: Participant) => {
    if (uploadedCount < totalCount) {
      alert(`Cannot generate or download certificate: All ${totalCount} statutory workshop module documents must be submitted first (currently ${uploadedCount}/${totalCount}).`);
      return;
    }

    setIsGenerating(true);
    setDownloadSuccessMessage('');

    setTimeout(() => {
      downloadSingleCertificate(p, {
        submissionTitle: 'Official Certificate of Completion',
        theme,
        customEmblemUrl,
        organization: organizationName,
        signatory1Name: signatory1Name || 'Thiru . Vishu Mahajan I.A.S',
        signatory1Title: signatory1Title || 'Authorized Signatory',
        documents,
      });

      setIsGenerating(false);
      setDownloadSuccessMessage(`Certificate for ${p.fullName} generated & downloaded successfully!`);
      triggerCelebration();
    }, 300);
  };

  const handleDownloadGroupBundle = () => {
    if (uploadedCount < totalCount) {
      alert(`Cannot generate or download certificates: All ${totalCount} statutory workshop module documents must be submitted first (currently ${uploadedCount}/${totalCount}).`);
      return;
    }

    setIsGenerating(true);
    setDownloadSuccessMessage('');

    setTimeout(() => {
      downloadGroupCertificatesBundle(groupParticipants, {
        submissionTitle: 'Official Certificate of Completion',
        theme,
        customEmblemUrl,
        organization: organizationName,
        signatory1Name: signatory1Name || 'Thiru . Vishu Mahajan I.A.S',
        signatory1Title: signatory1Title || 'Authorized Signatory',
        documents,
      });

      setIsGenerating(false);
      setDownloadSuccessMessage(
        `Batch PDF containing all ${groupParticipants.length} individual certificates downloaded!`
      );
      triggerCelebration();
    }, 400);
  };

  const handlePrint = () => {
    window.print();
  };

  // Theme border & accent styles
  const themeStyles = {
    gold: {
      border: 'border-amber-500',
      innerBorder: 'border-amber-300',
      badge: 'bg-amber-50 text-amber-900 border-amber-300',
      accentText: 'text-amber-800',
      sealBg: 'bg-amber-600',
    },
    navy: {
      border: 'border-sky-700',
      innerBorder: 'border-sky-300',
      badge: 'bg-sky-50 text-sky-900 border-sky-300',
      accentText: 'text-sky-800',
      sealBg: 'bg-sky-700',
    },
    emerald: {
      border: 'border-emerald-700',
      innerBorder: 'border-emerald-300',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      accentText: 'text-emerald-800',
      sealBg: 'bg-emerald-700',
    },
    crimson: {
      border: 'border-rose-700',
      innerBorder: 'border-rose-300',
      badge: 'bg-rose-50 text-rose-900 border-rose-300',
      accentText: 'text-rose-800',
      sealBg: 'bg-rose-700',
    },
  }[theme];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Warning Banner if Not All Documents Uploaded */}
      {uploadedCount < totalCount && (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-sm">Statutory {totalCount}-Document Requirement Incomplete ({uploadedCount}/{totalCount})</p>
              <p className="text-xs text-rose-700 mt-0.5">
                Official certificates cannot be issued or downloaded until all {totalCount} statutory workshop documents are submitted. Please return to Step 1 to upload the remaining {totalCount - uploadedCount} modules.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onBackToParticipants}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Step 3 of 3: Official Certificate Issuance & PDF Download
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
              Certificate Download Center
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Official PDF completion certificates generated based on your {totalCount}-module statutory submission. Download individually or as a complete bundle.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              Print Preview
            </button>

            {mode === 'individual' ? (
              <button
                type="button"
                id="download-individual-pdf-btn"
                onClick={() => handleDownloadSingle(singleParticipant)}
                disabled={isGenerating || uploadedCount < totalCount}
                className={`px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition ${
                  uploadedCount === totalCount && !isGenerating
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
                title={
                  uploadedCount === totalCount
                    ? 'Download official certificate'
                    : `Upload all ${totalCount} module documents in Step 1 first (${uploadedCount}/${totalCount})`
                }
              >
                <Download className={`w-4 h-4 ${uploadedCount === totalCount ? 'text-amber-400' : 'text-slate-400'}`} />
                {isGenerating ? 'Generating PDF...' : 'Download Official PDF Certificate'}
              </button>
            ) : (
              <button
                type="button"
                id="download-group-bundle-btn"
                onClick={handleDownloadGroupBundle}
                disabled={isGenerating || uploadedCount < totalCount}
                className={`px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition ${
                  uploadedCount === totalCount && !isGenerating
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-md'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                }`}
                title={
                  uploadedCount === totalCount
                    ? 'Download all certificates'
                    : `Upload all ${totalCount} module documents in Step 1 first (${uploadedCount}/${totalCount})`
                }
              >
                <Download className={`w-4 h-4 ${uploadedCount === totalCount ? 'text-amber-400' : 'text-slate-400'}`} />
                {isGenerating
                  ? 'Compiling Bundle...'
                  : `Download All Certificates (${groupParticipants.length} PDFs)`}
              </button>
            )}
          </div>
        </div>

        {downloadSuccessMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Main Layout: Certificate Preview Canvas + Sidebar Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: High Fidelity Certificate Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {mode === 'group' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 overflow-x-auto shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 shrink-0">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Select Candidate to Preview:</span>
              </div>
              <div className="flex items-center gap-2">
                {groupParticipants.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedGroupPreviewIndex(idx)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 ${
                      selectedGroupPreviewIndex === idx
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.fullName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Certificate Sheet Display */}
          <div
            id="certificate-print-area"
            className={`bg-[#fffdfa] border-[8px] ${themeStyles.border} rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-slate-900`}
          >
            {/* Hidden file input for manual image upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Inner Decorative Border */}
            <div
              className={`border-2 ${themeStyles.innerBorder} rounded-xl p-6 sm:p-8 h-full flex flex-col justify-between relative bg-white/70`}
            >
              {/* Watermark Emblem in Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                <Award className="w-96 h-96 text-slate-900" />
              </div>

              {/* Top Certificate Header */}
              <div className="text-center relative z-10 flex flex-col items-center">
                {/* Top Middle Emblem (Interactive: Click to upload/change) */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative mb-2.5 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 duration-200"
                  title="Click to manually upload / change the top middle certificate image"
                >
                  <img
                    src={displayedEmblem}
                    alt="Certificate Top Middle Emblem"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain select-none drop-shadow-sm transition-opacity group-hover:opacity-85"
                  />
                  <div className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center shadow-md">
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span className="text-[9px] font-bold leading-tight">Change Image</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-serif uppercase tracking-[0.25em] text-slate-700 font-bold">
                  {organizationName || 'GOVERNMENT OF TAMIL NADU'}
                </p>

                <h2 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-slate-900 mt-1.5">
                  Certificate of Completion
                </h2>

                <p className="text-xs uppercase tracking-widest text-slate-500 font-mono mt-1">
                  Official Completion & Verification Certificate
                </p>

                <div className="w-24 h-0.5 bg-amber-500 mx-auto my-3.5" />
              </div>

              {/* Recipient Body */}
              <div className="text-center my-6 relative z-10 space-y-3">
                <p className="text-xs sm:text-sm text-slate-600 italic font-serif">
                  This is to officially certify that
                </p>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-normal">
                  {activeParticipant.fullName}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  {activeParticipant.designation} • {activeParticipant.department}
                </p>

                <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed pt-2">
                  has successfully submitted, fulfilled, and completed all {totalCount} core statutory and technical
                  modules with verified compliance and proficiency.
                </p>

                {/* Statutory Headings Compact Grid in Certificate */}
                <div className="pt-3 pb-1">
                  <div className="inline-flex flex-wrap items-center justify-center gap-1.5 max-w-xl text-[10px] text-slate-600">
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <span
                        key={cat.id}
                        className="px-2 py-0.5 bg-slate-100/90 rounded border border-slate-200 font-medium"
                      >
                        ✓ {cat.title}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Signatory & Verification Seal */}
              <div className="pt-6 border-t border-slate-200 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Left: Certificate Identification Info */}
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                    Certificate ID
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 block">
                    {activeParticipant.certificateNumber}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    Issue Date: {activeParticipant.issueDate}
                  </span>
                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block font-semibold">
                    ✓ Verified & Digitally Endorsed
                  </span>
                </div>

                {/* Center Verification Seal: Official Seal Authenticated Record */}
                <OfficialSeal size="md" showLabels={true} />

                {/* Right: Sole Authorized Signatory */}
                <div className="text-center sm:text-right">
                  <div className="font-serif italic text-base text-slate-800 mb-1 border-b border-slate-300 pb-1 inline-block min-w-40 text-center">
                    {signatory1Name || 'Thiru . Vishu Mahajan I.A.S'}
                  </div>
                  <p className="text-xs font-bold text-slate-900">
                    {signatory1Name || 'Thiru . Vishu Mahajan I.A.S'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {signatory1Title || 'Authorized Signatory'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Download & Top Emblem Controls */}
        <div className="space-y-6">
          {/* Top Middle Emblem Upload & Management Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Certificate Top Image
              </h3>
              {isCustomEmblemActive ? (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Custom Image
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                  Official State Emblem
                </span>
              )}
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={displayedEmblem}
                  alt="Top Emblem Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {isCustomEmblemActive ? 'Custom Uploaded Image' : 'Official State Emblem'}
                </p>
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Displayed at top-middle of certificate &amp; PDF
                </p>
              </div>
            </div>

            {/* Drag and drop / Manual upload zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingEmblem(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDraggingEmblem(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingEmblem(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageFile(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl border-2 border-dashed transition text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                isDraggingEmblem
                  ? 'border-indigo-500 bg-indigo-50/70'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/30'
              }`}
            >
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              <p className="text-xs font-bold text-slate-800">
                Click or Drag Image to Upload
              </p>
              <p className="text-[10px] text-slate-500">
                PNG, JPG, SVG, WebP supported
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload New Image
              </button>

              {isCustomEmblemActive && (
                <button
                  type="button"
                  onClick={handleResetEmblem}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition"
                  title="Reset to official Tamil Nadu emblem"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Individual PDF Download Action */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-600" />
              Download Actions
            </h3>

            <div className="space-y-2.5">
              <button
                type="button"
                id="download-active-pdf-btn"
                onClick={() => handleDownloadSingle(activeParticipant)}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Download PDF for {activeParticipant.fullName}
              </button>

              {mode === 'group' && (
                <button
                  type="button"
                  id="download-all-group-btn"
                  onClick={handleDownloadGroupBundle}
                  className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <Users className="w-4 h-4" />
                  Download All {groupParticipants.length} Certificates
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 font-mono text-[11px]">
              <p className="flex justify-between">
                <span className="text-slate-500">Format:</span>
                <span className="font-bold text-slate-800">Vector A4 Landscape PDF</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Serial ID:</span>
                <span className="font-bold text-amber-800">{activeParticipant.certificateNumber}</span>
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Workshop Modules:</span>
                <span className="font-bold text-emerald-700">{totalCount} Completed Modules</span>
              </p>
            </div>
          </div>

          {/* Group Roster Individual Downloads */}
          {mode === 'group' && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Roster ({groupParticipants.length})</span>
                <span className="text-[10px] text-slate-500 font-normal">Individual PDFs</span>
              </h3>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
                {groupParticipants.map((p) => (
                  <div
                    key={p.id}
                    className="py-3 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{p.fullName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.certificateNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(p)}
                      disabled={uploadedCount < totalCount}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 shrink-0 ${
                        uploadedCount === totalCount
                          ? 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 cursor-pointer border border-slate-200'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'
                      }`}
                      title={uploadedCount === totalCount ? `Download PDF for ${p.fullName}` : `All ${totalCount} documents required`}
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Headings Checklist Verified Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              AI-Workshop Modules
            </h3>

            <div className="space-y-1.5 text-xs">
              {DOCUMENT_CATEGORIES.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between text-slate-700 py-1">
                  <span className="truncate max-w-[200px] text-[11px] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {cat.title}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">
                    Attached
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToParticipants}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Edit Participant Details</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {mode === 'individual' ? (
            <button
              type="button"
              onClick={() => handleDownloadSingle(singleParticipant)}
              disabled={uploadedCount < totalCount || isGenerating}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
                uploadedCount === totalCount && !isGenerating
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
              title={
                uploadedCount === totalCount
                  ? 'Download official certificate'
                  : `Upload all ${totalCount} module documents first (${uploadedCount}/${totalCount})`
              }
            >
              <Download className={`w-4 h-4 ${uploadedCount === totalCount ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Download Official PDF Certificate</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownloadGroupBundle}
              disabled={uploadedCount < totalCount || isGenerating}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
                uploadedCount === totalCount && !isGenerating
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              }`}
              title={
                uploadedCount === totalCount
                  ? 'Download all certificates'
                  : `Upload all ${totalCount} module documents first (${uploadedCount}/${totalCount})`
              }
            >
              <Download className={`w-4 h-4 ${uploadedCount === totalCount ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>Download All {groupParticipants.length} Certificates</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
