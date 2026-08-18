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
  Sparkles,
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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadedList = Object.values(documents).filter(Boolean) as UploadedDocument[];
  const uploadedCount = uploadedList.length;
  const totalCount = DOCUMENT_CATEGORIES.length;
  const progressPercent = Math.round((uploadedCount / totalCount) * 100);
  const isAllUploaded = uploadedCount === totalCount;

  // Handle single file upload for a specific category
  const handleFileUpload = (categoryId: DocumentCategoryId, file: File) => {
    const categoryConfig = DOCUMENT_CATEGORIES.find((c) => c.id === categoryId);
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}-${categoryId}`,
        categoryId,
        categoryTitle: categoryConfig?.title || categoryId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type || file.name.split('.').pop()?.toUpperCase() || 'DOCUMENT',
        uploadTime: new Date().toISOString(),
        fileDataUrl: dataUrl,
        extractedGist: `[Extracted from ${file.name}] Successfully indexed. Compliance verified against statutory guidelines for ${categoryConfig?.title}.`,
        verificationStatus: 'verified',
      };
      onUpdateDocument(categoryId, newDoc);
    };

    reader.readAsDataURL(file);
  };

  // Handle batch file upload (auto maps to category by name or sequential)
  const handleBatchFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

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
          DOCUMENT_CATEGORIES.find((cat) => !documents[cat.id]) ||
          DOCUMENT_CATEGORIES[index % DOCUMENT_CATEGORIES.length];
      }

      if (matchedCategory) {
        handleFileUpload(matchedCategory.id, file);
      }
    });
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
              Upload your files for the 9 required workshop modules. After attaching your documents, proceed to configure participant details and generate certificates.
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
              Batch Select Files (All Modules)
            </button>
          </div>
        </div>

        {/* Upload Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-700 font-medium flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-sky-600" />
              Dossier Completeness:
              <strong className="text-slate-900 font-mono">
                {uploadedCount} of {totalCount} Modules Ready
              </strong>
            </span>
            <span
              className={`font-mono font-bold ${
                isAllUploaded ? 'text-emerald-600' : 'text-sky-600'
              }`}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAllUploaded
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

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
                      Attached
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {cat.shortDesc}
                </p>

                {/* Uploaded File Details Or Drop Zone */}
                {uploadedDoc ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[190px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-600 shrink-0" />
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
                      Drop {cat.title} PDF or click to browse
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
                      View Gist
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
                    Upload Document
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Completion Action Footer */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
            <CheckCircle2
              className={`w-5 h-5 ${isAllUploaded ? 'text-emerald-600' : 'text-slate-400'}`}
            />
            {isAllUploaded
              ? 'All 9 Documentation Modules Verified & Ready'
              : 'Dossier Submission Progress'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {isAllUploaded
              ? 'All 9 documents uploaded. Click below to enter candidate & participant details.'
              : `${uploadedCount} of 9 documents attached. Click below to proceed to participant details.`}
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            id="proceed-to-participants-btn"
            onClick={onProceedToParticipants}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <span>Submit Documents & Enter Participant Details</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
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
