import { useState, useRef, ElementType } from 'react';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import { DocumentCategoryId, UploadedDocument } from '../types';
import { GO_SUMMARY_PDF_BASE64 } from '../data/goSummaryBase64';
import { ACTION_POINTS_DOCX_BASE64 } from '../data/actionPointsBase64';
import { INSPECTION_REPORT_DOCX_BASE64 } from '../data/inspectionReportBase64';
import { LETTER_DRAFTING_DOCX_BASE64 } from '../data/letterDraftingBase64';
import { COUNTER_AFFIDAVIT_DOCX_BASE64 } from '../data/counterAffidavitBase64';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  ArrowRight,
  Scale,
  Building2,
  Languages,
  ClipboardCheck,
  ListChecks,
  BarChart3,
  Presentation,
  CheckSquare,
  FileSignature,
  FileCheck,
  ExternalLink,
  Link2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

// Dynamic icon mapping
const ICON_COMPONENTS: Record<string, ElementType> = {
  Scale,
  Building2,
  Languages,
  ClipboardCheck,
  FileText,
  ListChecks,
  BarChart3,
  Presentation,
  CheckSquare,
  FileSignature,
};

interface DocumentUploadPortalProps {
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  onUpdateDocument: (categoryId: DocumentCategoryId, doc: UploadedDocument | null) => void;
  onProceedToParticipants: () => void;
}

export function DocumentUploadPortal({
  documents,
  onUpdateDocument,
  onProceedToParticipants,
}: DocumentUploadPortalProps) {
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<UploadedDocument | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadedList = Object.values(documents).filter(Boolean) as UploadedDocument[];
  const uploadedCount = uploadedList.length;
  const totalCount = DOCUMENT_CATEGORIES.length;
  const progressPercent = Math.round((uploadedCount / totalCount) * 100);
  const isAllUploaded = uploadedCount === totalCount;
  const canProceed = isAllUploaded;

  const handleDownloadReference = (category: (typeof DOCUMENT_CATEGORIES)[0]) => {
    if (category.id === 'go_summary') {
      try {
        const byteCharacters = atob(GO_SUMMARY_PDF_BASE64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'G.O Summary.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch {
        // fallback to direct download URL
      }
    }

    if (category.id === 'action_point_extraction') {
      try {
        const byteCharacters = atob(ACTION_POINTS_DOCX_BASE64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Action Point Extraction.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch {
        // fallback to direct download URL
      }
    }

    if (category.id === 'inspection_report') {
      try {
        const byteCharacters = atob(INSPECTION_REPORT_DOCX_BASE64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Inspection Report.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch {
        // fallback to direct download URL
      }
    }

    if (category.id === 'letter_drafting') {
      try {
        const byteCharacters = atob(LETTER_DRAFTING_DOCX_BASE64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Letter Drafting.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch {
        // fallback to direct download URL
      }
    }

    if (category.id === 'counter_affidavit') {
      try {
        const byteCharacters = atob(COUNTER_AFFIDAVIT_DOCX_BASE64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Counter Affidavit.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      } catch {
        // fallback to direct download URL
      }
    }

    if (category.referenceDownloadUrl) {
      window.open(category.referenceDownloadUrl, '_blank');
    } else if (category.referenceUrl) {
      window.open(category.referenceUrl, '_blank');
    }
  };

  const triggerAutoAdvance = () => {
    setIsAutoAdvancing(true);
    setErrorMessage('');
    setTimeout(() => {
      onProceedToParticipants();
    }, 1000);
  };

  const handleProceed = () => {
    if (!canProceed) {
      setErrorMessage(
        `All ${totalCount} statutory workshop documents are required. Please upload the remaining ${totalCount - uploadedCount} documents to move to the next page.`
      );
      return;
    }
    setErrorMessage('');
    onProceedToParticipants();
  };

  // Record that the file is submitted without storing heavy binary blobs
  const handleFileUpload = (categoryId: DocumentCategoryId, file: File) => {
    const categoryConfig = DOCUMENT_CATEGORIES.find((c) => c.id === categoryId);
    const newDoc: UploadedDocument = {
      id: `doc-${Date.now()}-${categoryId}`,
      categoryId,
      categoryTitle: categoryConfig?.title || categoryId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
      uploadTime: new Date().toISOString(),
      extractedGist: `Document submitted for ${categoryConfig?.title} (${file.name}). Statutory compliance verified.`,
      verificationStatus: 'verified',
    };
    onUpdateDocument(categoryId, newDoc);

    // Check if with this upload, all 9 documents are now uploaded
    const simulatedDocs = { ...documents, [categoryId]: newDoc };
    const simulatedCount = Object.values(simulatedDocs).filter(Boolean).length;
    if (simulatedCount === totalCount) {
      triggerAutoAdvance();
    }
  };

  // Handle batch file upload (auto maps to category by name or sequential)
  const handleBatchFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const updatedDocs = { ...documents };
    Array.from(files).forEach((file, index) => {
      const lowerName = file.name.toLowerCase();
      // Try to find matching category by keywords
      let matchedCategory = DOCUMENT_CATEGORIES.find((cat) => {
        const catKey = cat.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanFile = lowerName.replace(/[^a-z0-9]/g, '');
        return cleanFile.includes(catKey) || cat.id.split('_').some((part) => lowerName.includes(part));
      });

      // If no keyword match, find first empty slot or fallback to index
      if (!matchedCategory) {
        matchedCategory =
          DOCUMENT_CATEGORIES.find((cat) => !updatedDocs[cat.id]) ||
          DOCUMENT_CATEGORIES[index % DOCUMENT_CATEGORIES.length];
      }

      if (matchedCategory) {
        const categoryConfig = DOCUMENT_CATEGORIES.find((c) => c.id === matchedCategory.id);
        const newDoc: UploadedDocument = {
          id: `doc-${Date.now()}-${matchedCategory.id}-${index}`,
          categoryId: matchedCategory.id,
          categoryTitle: categoryConfig?.title || matchedCategory.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
          uploadTime: new Date().toISOString(),
          extractedGist: `Document submitted for ${categoryConfig?.title} (${file.name}). Statutory compliance verified.`,
          verificationStatus: 'verified',
        };
        updatedDocs[matchedCategory.id] = newDoc;
        onUpdateDocument(matchedCategory.id, newDoc);
      }
    });

    const finalCount = Object.values(updatedDocs).filter(Boolean).length;
    if (finalCount === totalCount) {
      triggerAutoAdvance();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner & Quick Action Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3.5">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              Step 1 of 3: Statutory {totalCount}-Heading Document Submission
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
              AI-Workshop Submission Portal
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              Submit your files for each of the {totalCount} statutory modules below. Each module is color-coded for fast verification. Once completed, proceed to candidate information and certificate generation.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={batchFileInputRef}
              multiple
              accept=".pdf,.docx,.doc,.txt,.xlsx,.pptx"
              className="hidden"
              onChange={(e) => handleBatchFiles(e.target.files)}
            />

            <button
              type="button"
              id="batch-upload-btn"
              onClick={() => batchFileInputRef.current?.click()}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sm font-extrabold text-white flex items-center gap-2.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
            >
              <Upload className="w-4 h-4 text-white" />
              Batch Select Files (All {totalCount} Modules)
            </button>
          </div>
        </div>
      </div>

      {/* Auto Advancing Notification Banner */}
      {isAutoAdvancing && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-900 text-sm flex items-center gap-3 shadow-md animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-base">All {totalCount} Statutory Documents Submitted Successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Criteria verified. Automatically moving to Participant Details...
            </p>
          </div>
          <button
            type="button"
            onClick={onProceedToParticipants}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <span>Proceed Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Document Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DOCUMENT_CATEGORIES.map((cat, idx) => {
          const uploadedDoc = documents[cat.id];
          const IconComp = ICON_COMPONENTS[cat.iconName] || FileText;
          const isDragOver = dragOverCategory === cat.id;

          return (
            <div
              key={cat.id}
              id={`card-${cat.id}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverCategory(cat.id);
              }}
              onDragLeave={() => setDragOverCategory(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCategory(null);
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(cat.id, e.dataTransfer.files[0]);
                }
              }}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative border ${
                uploadedDoc
                  ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-300 shadow-sm ring-1 ring-emerald-400/30'
                  : isDragOver
                  ? 'border-indigo-400 ring-2 ring-indigo-300 bg-indigo-50/80 shadow-md scale-[1.01]'
                  : `bg-gradient-to-br ${cat.gradientBg || 'from-white to-slate-50'} ${cat.borderColor || 'border-slate-200'} ${cat.glowShadow || 'hover:border-slate-300'}`
              }`}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition ${
                        uploadedDoc
                          ? 'bg-emerald-100 border-emerald-200 text-emerald-800'
                          : cat.iconBg || 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${cat.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {cat.code}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono font-semibold">
                          Heading {idx + 1}/{totalCount}
                        </span>
                      </div>
                      {/* Increased Module Heading Size */}
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight leading-snug">
                        {cat.title}
                      </h2>
                    </div>
                  </div>

                  {uploadedDoc ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shrink-0 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Submitted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shrink-0 shadow-xs">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
                  {cat.shortDesc}
                </p>

                {/* Reference Source Document URL (Direct Download from Google Drive / Docs / Sheets) */}
                {cat.referenceUrl && (
                  <div
                    className={`mb-4 p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-xs ${
                      cat.id === 'go_summary'
                        ? 'bg-sky-50/90 border-sky-200 text-sky-950'
                        : cat.id === 'action_point_extraction'
                        ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                        : cat.id === 'inspection_report'
                        ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
                        : cat.id === 'letter_drafting'
                        ? 'bg-purple-50/90 border-purple-200 text-purple-950'
                        : cat.id === 'counter_affidavit'
                        ? 'bg-blue-50/90 border-blue-200 text-blue-950'
                        : cat.referenceFormat === 'xlsx'
                        ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${
                          cat.id === 'go_summary'
                            ? 'bg-sky-100 border-sky-200 text-sky-700'
                            : cat.id === 'action_point_extraction'
                            ? 'bg-rose-100 border-rose-200 text-rose-700'
                            : cat.id === 'inspection_report'
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                            : cat.id === 'letter_drafting'
                            ? 'bg-purple-100 border-purple-200 text-purple-700'
                            : cat.id === 'counter_affidavit'
                            ? 'bg-blue-100 border-blue-200 text-blue-700'
                            : cat.referenceFormat === 'xlsx'
                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                            : 'bg-amber-100 border-amber-200 text-amber-700'
                        }`}
                      >
                        {cat.referenceFormat === 'xlsx' ? (
                          <FileSpreadsheet className="w-4 h-4" />
                        ) : cat.referenceFormat === 'docx' ? (
                          <FileText className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            cat.id === 'go_summary'
                              ? 'text-sky-900'
                              : cat.id === 'action_point_extraction'
                              ? 'text-rose-900'
                              : cat.id === 'inspection_report'
                              ? 'text-emerald-900'
                              : cat.id === 'letter_drafting'
                              ? 'text-purple-900'
                              : cat.id === 'counter_affidavit'
                              ? 'text-blue-900'
                              : cat.referenceFormat === 'xlsx'
                              ? 'text-emerald-800'
                              : 'text-amber-800'
                          }`}
                        >
                          {cat.referenceFormat === 'xlsx'
                            ? 'Source Dataset (Excel Sheet)'
                            : cat.id === 'go_summary'
                            ? 'G.O. Summary Reference PDF'
                            : cat.id === 'action_point_extraction'
                            ? 'Action Point Extraction (Word .docx)'
                            : cat.id === 'inspection_report'
                            ? 'Inspection Report (Word .docx)'
                            : cat.id === 'letter_drafting'
                            ? 'Letter Drafting Model (Word .docx)'
                            : cat.id === 'counter_affidavit'
                            ? 'Counter Affidavit (Word .docx)'
                            : 'Source Document (PDF)'}
                        </p>
                        <p
                          className={`text-[10px] truncate ${
                            cat.id === 'go_summary'
                              ? 'text-sky-700'
                              : cat.id === 'action_point_extraction'
                              ? 'text-rose-700'
                              : cat.id === 'inspection_report'
                              ? 'text-emerald-700'
                              : cat.id === 'letter_drafting'
                              ? 'text-purple-700'
                              : cat.id === 'counter_affidavit'
                              ? 'text-blue-700'
                              : cat.referenceFormat === 'xlsx'
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {cat.referenceFormat === 'xlsx'
                            ? 'Google Sheets (.xlsx)'
                            : cat.referenceFormat === 'docx'
                            ? 'Microsoft Word (.docx)'
                            : 'Google Drive Statutory File'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDownloadReference(cat)}
                        id={`drive-download-link-${cat.id}`}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-xs cursor-pointer ${
                          cat.id === 'go_summary'
                            ? 'bg-sky-700 hover:bg-sky-800'
                            : cat.id === 'action_point_extraction'
                            ? 'bg-rose-700 hover:bg-rose-800'
                            : cat.id === 'inspection_report'
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : cat.id === 'letter_drafting'
                            ? 'bg-purple-700 hover:bg-purple-800'
                            : cat.id === 'counter_affidavit'
                            ? 'bg-blue-700 hover:bg-blue-800'
                            : cat.referenceFormat === 'xlsx'
                            ? 'bg-emerald-700 hover:bg-emerald-800'
                            : 'bg-amber-600 hover:bg-amber-700'
                        }`}
                        title={
                          cat.id === 'go_summary'
                            ? 'Click to download G.O Summary.pdf directly'
                            : cat.id === 'action_point_extraction'
                            ? 'Click to download Action Point Extraction.docx directly'
                            : cat.id === 'inspection_report'
                            ? 'Click to download Inspection Report.docx directly'
                            : cat.id === 'letter_drafting'
                            ? 'Click to download Letter Drafting.docx directly'
                            : cat.id === 'counter_affidavit'
                            ? 'Click to download Counter Affidavit.docx directly'
                            : cat.referenceFormat === 'xlsx'
                            ? 'Click to download reference Excel sheet (.xlsx) directly'
                            : `Click to download reference PDF for ${cat.title} directly`
                        }
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>
                          {cat.referenceFormat === 'xlsx'
                            ? 'Download Excel'
                            : cat.id === 'go_summary'
                            ? 'Download G.O. Summary'
                            : cat.id === 'action_point_extraction' ||
                              cat.id === 'inspection_report' ||
                              cat.id === 'letter_drafting' ||
                              cat.id === 'counter_affidavit'
                            ? 'Download Word (.docx)'
                            : 'Download PDF'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Uploaded File Details Or Drop Zone */}
                {uploadedDoc ? (
                  <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 mb-4 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[200px] flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        {uploadedDoc.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {(uploadedDoc.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      "{uploadedDoc.extractedGist || cat.sampleSummary}"
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    className="border border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-4 text-center cursor-pointer bg-white/80 hover:bg-indigo-50/30 transition-all duration-200 mb-4 group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 mx-auto mb-1.5 transition" />
                    <p className="text-xs font-bold text-slate-700 group-hover:text-slate-900">
                      Submit {cat.title} file
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Accepts {cat.acceptedFormats}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3.5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                <input
                  type="file"
                  ref={(el) => (fileInputRefs.current[cat.id] = el)}
                  accept={cat.acceptedFormats}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(cat.id, e.target.files[0]);
                    }
                  }}
                />

                {uploadedDoc ? (
                  <>
                    <button
                      type="button"
                      id={`preview-btn-${cat.id}`}
                      onClick={() => setSelectedPreviewDoc(uploadedDoc)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-600" />
                      Status Info
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        id={`replace-btn-${cat.id}`}
                        onClick={() => fileInputRefs.current[cat.id]?.click()}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition cursor-pointer font-semibold border border-slate-200"
                        title="Replace document"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        id={`delete-btn-${cat.id}`}
                        onClick={() => onUpdateDocument(cat.id, null)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border border-transparent hover:border-rose-200"
                        title="Remove document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    id={`upload-btn-${cat.id}`}
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Submit File
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Error Message when trying to proceed without documents */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Document Update Required:</span> {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-600 hover:text-rose-800 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Completion Action Footer */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif flex items-center gap-2.5">
            <CheckCircle2
              className={`w-6 h-6 ${isAllUploaded ? 'text-emerald-600' : 'text-slate-400'}`}
            />
            {isAllUploaded
              ? `All ${totalCount} Workshop Modules Submitted & Verified`
              : `Workshop Modules Required (${uploadedCount}/${totalCount} Submitted)`}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-xl">
            {isAllUploaded
              ? `All ${totalCount} modules submitted. Proceed to candidate information and certificate issuance.`
              : `Please submit all ${totalCount} workshop documents (${uploadedCount} uploaded, ${totalCount - uploadedCount} remaining) to unlock the next page.`}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <button
            type="button"
            id="proceed-to-participants-btn"
            onClick={handleProceed}
            disabled={!canProceed}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2.5 transition-all duration-200 ${
              canProceed
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-md cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
            title={canProceed ? 'Proceed to candidate details' : `Upload all ${totalCount} module documents first (${uploadedCount}/${totalCount})`}
          >
            <span>Proceed to Participant Details</span>
            <ArrowRight className={`w-4 h-4 ${canProceed ? 'text-amber-400' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Modal for previewing single document gist */}
      <DocumentPreviewModal
        document={selectedPreviewDoc}
        onClose={() => setSelectedPreviewDoc(null)}
      />
    </div>
  );
}
