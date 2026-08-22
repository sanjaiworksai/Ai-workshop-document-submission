export interface UserSession {
  email: string;
  name: string;
  avatar?: string;
  department?: string;
  designation?: string;
  organization?: string;
  loginAt: string;
}

export type DocumentCategoryId =
  | 'court_order_gist'
  | 'go_summary'
  | 'translation'
  | 'inspection_report'
  | 'letter_drafting'
  | 'action_point_extraction'
  | 'review_data_analysis'
  | 'ppt_creation_template'
  | 'inspection_checklist'
  | 'counter_affidavit';

export interface DocumentCategoryConfig {
  id: DocumentCategoryId;
  title: string;
  code: string;
  shortDesc: string;
  iconName: string;
  badgeColor: string;
  acceptedFormats: string;
  sampleSummary: string;
  referenceUrl?: string;
  referenceDownloadUrl?: string;
  referenceFormat?: 'pdf' | 'xlsx' | 'docx' | 'csv';
  gradientBg?: string;
  borderColor?: string;
  accentColor?: string;
  iconBg?: string;
  glowShadow?: string;
  promptText?: string;
  promptUrl?: string;
}

export interface UploadedDocument {
  id: string;
  categoryId: DocumentCategoryId;
  categoryTitle: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadTime: string;
  fileDataUrl?: string;
  extractedGist?: string;
  pageCount?: number;
  verificationStatus: 'verified' | 'pending' | 'review_required';
  notes?: string;
}

export type CertificateTheme = 'gold' | 'navy' | 'emerald' | 'crimson';

export interface Participant {
  id: string;
  fullName: string;
  email?: string;
  designation: string;
  department: string;
  organization: string;
  certificateNumber: string;
  issueDate: string;
  verificationCode: string;
  scoreOrGrade?: string;
  specialMention?: string;
}

export interface UserWorkspaceData {
  user: UserSession;
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  mode: 'individual' | 'group';
  theme: CertificateTheme;
  organizationName: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  singleParticipant: Participant;
  groupParticipants: Participant[];
  customEmblemUrl?: string;
  currentStep: 'upload' | 'participants' | 'certificate';
  lastUpdated: string;
}

export interface AccountSummary {
  email: string;
  name: string;
  avatar?: string;
  uploadedCount: number;
  participantsCount: number;
  lastActive: string;
  mode: 'individual' | 'group';
}

export interface CertificateSubmission {
  id: string;
  referenceNumber: string;
  submissionTitle: string;
  submittedByEmail: string;
  submittedByName: string;
  submittedAt: string;
  mode: 'individual' | 'group';
  organization: string;
  theme: CertificateTheme;
  customEmblemUrl?: string;
  signatory1Name: string;
  signatory1Title: string;
  signatory2Name: string;
  signatory2Title: string;
  documents: Record<DocumentCategoryId, UploadedDocument | null>;
  participants: Participant[];
}

