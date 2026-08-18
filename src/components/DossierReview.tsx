import { useState } from 'react';
import { DocumentCategoryId, UploadedDocument } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Award,
  Download,
  Building,
  Scale,
  FileText,
} from 'lucide-react';
import { DocumentPreviewModal } from './DocumentPreviewModal';

interface DossierReviewProps {
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  userName: string;
  userEmail: string;
  onProceedToCertificates: () => void;
  onBackToUpload: () => void;
}

export function DossierReview({
  documents,
  userName,
  userEmail,
  onProceedToCertificates,
  onBackToUpload,
}: DossierReviewProps) {
  const [selectedPreviewDoc, setSelectedPreviewDoc] = useState<UploadedDocument | null>(null);

  const uploadedDocs = Object.values(documents).filter(Boolean) as UploadedDocument[];
  const uploadedCount = uploadedDocs.length;
  const totalCount = DOCUMENT_CATEGORIES.length;
  const isComplete = uploadedCount === totalCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            AI-Workshop Module Review & Verification
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-serif">
            9-Module AI-Workshop Compliance Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review all submitted documents, extracted gists, and statutory verification status before official certificate generation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToUpload}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Uploads
          </button>
          <button
            type="button"
            onClick={onProceedToCertificates}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-sky-950 flex items-center gap-2 transition cursor-pointer"
          >
            <span>Proceed to Certificate Issuance</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Compilation Status</span>
          <p className="text-xl font-bold text-white mt-1 flex items-center gap-2 font-serif">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            {isComplete ? '100% Fully Compliant' : `${uploadedCount} / ${totalCount} Modules Ready`}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            All 9 categories indexed & verified
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Submitting Authority</span>
          <p className="text-base font-bold text-white mt-1 truncate font-serif">
            {userName}
          </p>
          <span className="text-[11px] text-slate-400 truncate block font-mono">
            {userEmail}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <span className="text-xs text-slate-400 block font-medium">Certification Modes</span>
          <p className="text-base font-bold text-amber-400 mt-1 flex items-center gap-1.5 font-serif">
            <Award className="w-5 h-5" />
            Individual & Group Enabled
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            PDFs with tamper-evident seal & QR
          </span>
        </div>
      </div>

      {/* Table of all 9 Headings and their Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-serif">
              9-Heading AI-Workshop Itemized Module Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Each document fulfills statutory audit requirements
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            {uploadedCount} / {totalCount} Ready
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {DOCUMENT_CATEGORIES.map((cat, idx) => {
            const doc = documents[cat.id];

            return (
              <div
                key={cat.id}
                className="p-5 hover:bg-slate-800/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4 max-w-2xl">
                  <span className="w-8 h-8 rounded-xl bg-slate-800 text-sky-400 flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {cat.code}
                      </span>
                      <h4 className="text-sm font-bold text-white font-serif">
                        {cat.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {doc?.extractedGist || cat.sampleSummary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end space-x-4 shrink-0">
                  {doc ? (
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                        {doc.fileName} ({(doc.fileSize / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-800/60">
                      Pending Upload
                    </span>
                  )}

                  {doc && (
                    <button
                      type="button"
                      onClick={() => setSelectedPreviewDoc(doc)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                      View
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DocumentPreviewModal
        document={selectedPreviewDoc}
        onClose={() => setSelectedPreviewDoc(null)}
      />
    </div>
  );
}
