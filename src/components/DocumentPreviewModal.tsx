import { UploadedDocument } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import { X, FileText, CheckCircle2, Download, Calendar, HardDrive, Shield, ExternalLink } from 'lucide-react';

interface DocumentPreviewModalProps {
  document: UploadedDocument | null;
  onClose: () => void;
}

export function DocumentPreviewModal({ document, onClose }: DocumentPreviewModalProps) {
  if (!document) return null;

  const categoryConfig = DOCUMENT_CATEGORIES.find((c) => c.id === document.categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">{document.categoryTitle}</h3>
              <p className="text-xs text-slate-500 truncate max-w-md">{document.fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Metadata chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">File Size</span>
              <span className="text-xs font-mono font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                {(document.fileSize / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Uploaded At</span>
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date(document.uploadTime).toLocaleDateString()}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Format</span>
              <span className="text-xs font-mono font-semibold text-sky-700 uppercase mt-0.5 block">
                {document.fileType || 'PDF Document'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Audit Status</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            </div>
          </div>

          {/* Document Content / Gist Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Extracted Gist & Compliance Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200 font-mono whitespace-pre-line">
              {document.extractedGist || 'Document uploaded and indexed in the statutory audit pipeline.'}
            </p>
          </div>

          {/* Document Verification Seal */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Statutory Compliance Cleared</p>
                <p className="text-[11px] text-emerald-700">
                  Ready for inclusion in official individual & group certificates
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200 font-semibold">
              SEC-VALID-2026
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition cursor-pointer"
          >
            Close Preview
          </button>
          {categoryConfig?.referenceUrl && (
            <a
              href={categoryConfig.referenceDownloadUrl || categoryConfig.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`${categoryConfig.code}_${categoryConfig.title.replace(/\s+/g, '_')}.pdf`}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
              title="Download Google Drive source document as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Source PDF</span>
            </a>
          )}
          {document.fileDataUrl && (
            <a
              href={document.fileDataUrl}
              download={document.fileName}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Download File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
