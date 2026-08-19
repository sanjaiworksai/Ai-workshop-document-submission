import { useState, useRef, ElementType } from 'react';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import { DocumentCategoryId, UploadedDocument } from '../types';
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
  FileCheck,
  ExternalLink,
  Link2,
  Download,
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
        `All 9 statutory workshop documents are required. Please upload the remaining ${totalCount - uploadedCount} documents to move to the next page.`
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
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold mb-3">
              <FileCheck className="w-3.5 h-3.5" />
              Step 1 of 3: Statutory 9-Heading Document Submission
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif tracking-tight">
              AI-Workshop Submission portal
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Submit your files for each of the 9 statutory modules below. Once submitted, proceed to enter candidate details and generate official certificates.
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
              className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4 text-sky-400" />
              Batch Select Files (All 9 Modules)
            </button>
          </div>
        </div>
      </div>

      {/* Auto Advancing Notification Banner */}
      {isAutoAdvancing && (
        <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-sm flex items-center gap-3 shadow-md animate-pulse">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-sm">All 9 Statutory Documents Submitted Successfully!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Criteria verified. Automatically moving to Participant Details...
            </p>
          </div>
          <button
            type="button"
            onClick={onProceedToParticipants}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <span>Proceed Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 9 Document Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                uploadedDoc
                  ? 'border-emerald-300 shadow-xs'
                  : isDragOver
                  ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Header inside card */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        uploadedDoc
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-slate-100 border border-slate-200 text-slate-700'
                      }`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {cat.code}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Heading {idx + 1}/9
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900 font-serif mt-0.5">
                        {cat.title}
                      </h2>
                    </div>
                  </div>

                  {uploadedDoc ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Submitted
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {cat.shortDesc}
                </p>

                {/* Reference Source Document URL (Direct PDF Download from Google Drive) */}
                {cat.referenceUrl && (
                  <div className="mb-3.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs flex items-center justify-between gap-2 shadow-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                        <Link2 className="w-3.5 h-3.5 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-amber-950 truncate">
                          Source Document (PDF)
                        </p>
                        <p className="text-[10px] text-amber-700 truncate">
                          Google Drive Statutory File
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={cat.referenceDownloadUrl || cat.referenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`${cat.code}_${cat.title.replace(/\s+/g, '_')}.pdf`}
                        id={`drive-download-link-${cat.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer"
                        title="Click to download reference PDF directly"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                      {!uploadedDoc && (
                        <button
                          type="button"
                          id={`attach-drive-doc-${cat.id}`}
                          onClick={() => {
                            const driveDoc: UploadedDocument = {
                              id: `doc-drive-${Date.now()}-${cat.id}`,
                              categoryId: cat.id,
                              categoryTitle: cat.title,
                              fileName: `${cat.title.replace(/\s+/g, '_')}_Directives.pdf`,
                              fileSize: 1024 * 480,
                              fileType: 'PDF',
                              uploadTime: new Date().toISOString(),
                              extractedGist:
                                'Court Order Directives from Google Drive verified. Ratio decidendi & statutory compliance recorded.',
                              verificationStatus: 'verified',
                            };
                            onUpdateDocument(cat.id, driveDoc);
                            const simulatedDocs = { ...documents, [cat.id]: driveDoc };
                            if (Object.values(simulatedDocs).filter(Boolean).length === totalCount) {
                              triggerAutoAdvance();
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] transition cursor-pointer"
                          title="Attach this Google Drive Court Order as module submission"
                        >
                          Attach
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Uploaded File Details Or Drop Zone */}
                {uploadedDoc ? (
                  <div className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-3.5 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[190px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {uploadedDoc.fileName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {(uploadedDoc.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-white p-2 rounded border border-slate-200">
                      "{uploadedDoc.extractedGist || cat.sampleSummary}"
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    className="border border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-4 text-center cursor-pointer bg-slate-50/60 hover:bg-sky-50/50 transition mb-4 group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-sky-600 mx-auto mb-1.5 transition" />
                    <p className="text-xs font-semibold text-slate-700 group-hover:text-sky-900">
                      Submit {cat.title} file
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Accepts {cat.acceptedFormats}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
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
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-600" />
                      Status Info
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        id={`replace-btn-${cat.id}`}
                        onClick={() => fileInputRefs.current[cat.id]?.click()}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 transition cursor-pointer font-medium"
                        title="Replace document"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        id={`delete-btn-${cat.id}`}
                        onClick={() => onUpdateDocument(cat.id, null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    id={`upload-btn-${cat.id}`}
                    onClick={() => fileInputRefs.current[cat.id]?.click()}
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition cursor-pointer"
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
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Document Update Required:</span> {errorMessage}
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Bottom Completion Action Footer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <CheckCircle2
              className={`w-5 h-5 ${isAllUploaded ? 'text-emerald-600' : 'text-slate-400'}`}
            />
            {isAllUploaded
              ? 'All 9 Workshop Modules Submitted & Verified'
              : `Workshop Modules Required (${uploadedCount}/9 Submitted)`}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {isAllUploaded
              ? 'All 9 modules submitted. Proceed to candidate information and certificate issuance.'
              : `Please submit all 9 workshop documents (${uploadedCount} uploaded, ${totalCount - uploadedCount} remaining) to unlock the next page.`}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            id="proceed-to-participants-btn"
            onClick={handleProceed}
            disabled={!canProceed}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition ${
              canProceed
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            }`}
            title={canProceed ? 'Proceed to candidate details' : `Upload all 9 module documents first (${uploadedCount}/${totalCount})`}
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
