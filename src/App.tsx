import { useState, useEffect, useCallback } from 'react';
import {
  UserSession,
  DocumentCategoryId,
  UploadedDocument,
  Participant,
  CertificateTheme,
  UserWorkspaceData,
} from './types';
import { DOCUMENT_CATEGORIES } from './data/categories';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { DocumentUploadPortal } from './components/DocumentUploadPortal';
import { ParticipantDetailsStep } from './components/ParticipantDetailsStep';
import { CertificateHub } from './components/CertificateHub';
import {
  getUserWorkspace,
  getUserWorkspaceFromIndexedDB,
  saveUserWorkspace,
  createNewWorkspaceForUser,
  getActiveUserEmail,
  setActiveUserEmail,
  normalizeEmail,
} from './utils/storage';

export default function App() {
  // Current Active User
  const [user, setUser] = useState<UserSession | null>(() => {
    const activeEmail = getActiveUserEmail();
    if (activeEmail) {
      const ws = getUserWorkspace(activeEmail);
      if (ws) return ws.user;
    }
    return null;
  });

  // Current Step: 'upload' -> 'participants' -> 'certificate'
  const [currentStep, setCurrentStep] = useState<'upload' | 'participants' | 'certificate'>('upload');

  // Mode: 'individual' | 'group'
  const [mode, setMode] = useState<'individual' | 'group'>('individual');

  // Certificate Theme
  const [theme, setTheme] = useState<CertificateTheme>('gold');

  // Organization & Signatories
  const [organizationName, setOrganizationName] = useState('State Administrative & Legal Directorate');
  const [signatory1Name, setSignatory1Name] = useState('Dr. Rajeshwari Sundaram, IAS');
  const [signatory1Title, setSignatory1Title] = useState('Principal Reviewing Authority');
  const [signatory2Name, setSignatory2Name] = useState('Adv. Vikramaditya Verma');
  const [signatory2Title, setSignatory2Title] = useState('Chief Legal Auditor');

  // Single Candidate Details
  const [singleParticipant, setSingleParticipant] = useState<Participant>({
    id: 'single-init',
    fullName: 'Sanjai Kumar',
    email: 'sanjaiworksai@gmail.com',
    designation: 'Senior Administrative Officer',
    department: 'Legal & Administrative Affairs Wing',
    organization: 'State Administrative & Legal Directorate',
    certificateNumber: 'CERT-ADM-2026-88412',
    issueDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    verificationCode: 'VERIF-HASH-88A92',
  });

  // Group Candidates Details
  const [groupParticipants, setGroupParticipants] = useState<Participant[]>([]);

  // Documents State (stores all 9 categories for the active user)
  const [documents, setDocuments] = useState<Record<DocumentCategoryId, UploadedDocument | null>>(() => {
    const initial: Partial<Record<DocumentCategoryId, UploadedDocument | null>> = {};
    DOCUMENT_CATEGORIES.forEach((cat) => {
      initial[cat.id] = null;
    });
    return initial as Record<DocumentCategoryId, UploadedDocument | null>;
  });

  // Load User Workspace when user session changes
  const loadWorkspaceForUser = useCallback((session: UserSession) => {
    let ws = getUserWorkspace(session.email);
    if (!ws) {
      ws = createNewWorkspaceForUser(session);
      saveUserWorkspace(ws);
    }

    setUser(ws.user);
    setDocuments(ws.documents);
    setMode(ws.mode);
    setTheme(ws.theme);
    setOrganizationName(ws.organizationName);
    setSignatory1Name(ws.signatory1Name);
    setSignatory1Title(ws.signatory1Title);
    setSignatory2Name(ws.signatory2Name);
    setSignatory2Title(ws.signatory2Title);
    setSingleParticipant(ws.singleParticipant);
    setGroupParticipants(ws.groupParticipants);
    setCurrentStep(ws.currentStep);
    setActiveUserEmail(session.email);

    // Asynchronously hydrate any full documents stored in IndexedDB
    getUserWorkspaceFromIndexedDB(session.email).then((idbWs) => {
      if (idbWs && idbWs.documents) {
        setDocuments((prevDocs) => {
          const merged = { ...prevDocs };
          let changed = false;
          for (const [k, v] of Object.entries(idbWs.documents)) {
            const cat = k as DocumentCategoryId;
            if (v && v.fileDataUrl && (!merged[cat] || !merged[cat]?.fileDataUrl)) {
              merged[cat] = v;
              changed = true;
            }
          }
          return changed ? merged : prevDocs;
        });
      }
    });
  }, []);

  // Initialize on mount if active email exists
  useEffect(() => {
    const activeEmail = getActiveUserEmail();
    if (activeEmail && !user) {
      const ws = getUserWorkspace(activeEmail);
      if (ws) {
        loadWorkspaceForUser(ws.user);
      }
    }
  }, [loadWorkspaceForUser, user]);

  // Persist the active workspace whenever any piece of user data changes
  useEffect(() => {
    if (!user) return;

    const currentWorkspace: UserWorkspaceData = {
      user,
      documents,
      mode,
      theme,
      organizationName,
      signatory1Name,
      signatory1Title,
      signatory2Name,
      signatory2Title,
      singleParticipant,
      groupParticipants,
      currentStep,
      lastUpdated: new Date().toISOString(),
    };

    saveUserWorkspace(currentWorkspace);
  }, [
    user,
    documents,
    mode,
    theme,
    organizationName,
    signatory1Name,
    signatory1Title,
    signatory2Name,
    signatory2Title,
    singleParticipant,
    groupParticipants,
    currentStep,
  ]);

  const handleLogin = (session: UserSession) => {
    loadWorkspaceForUser(session);
  };

  const handleSwitchUser = (targetEmail: string) => {
    const ws = getUserWorkspace(targetEmail);
    if (ws) {
      loadWorkspaceForUser(ws.user);
    } else {
      const cleanEmail = normalizeEmail(targetEmail);
      const rawName = cleanEmail.split('@')[0];
      const formattedName = rawName
        .split(/[._-]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      loadWorkspaceForUser({
        email: cleanEmail,
        name: formattedName,
        loginAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}&backgroundColor=0284c7,1e3a8a,047857`,
      });
    }
  };

  const handleLogout = () => {
    setActiveUserEmail(null);
    setUser(null);
  };

  const handleUpdateDocument = (categoryId: DocumentCategoryId, doc: UploadedDocument | null) => {
    setDocuments((prev) => ({
      ...prev,
      [categoryId]: doc,
    }));
  };

  // If not logged in, show Gmail Auth Screen with saved account workspaces
  if (!user) {
    return <AuthScreen onLogin={handleLogin} defaultEmail="" />;
  }

  const uploadedCount = Object.values(documents).filter(Boolean).length;
  const totalCount = DOCUMENT_CATEGORIES.length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Header with Multi-User Isolation & Stepper */}
      <Header
        user={user}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        uploadedCount={uploadedCount}
        totalCount={totalCount}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
      />

      {/* Main Content Area based on current Step */}
      <main className="flex-1">
        {currentStep === 'upload' && (
          <DocumentUploadPortal
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            onProceedToParticipants={() => {
              setCurrentStep('participants');
            }}
          />
        )}

        {currentStep === 'participants' && (
          <ParticipantDetailsStep
            documents={documents}
            defaultEmail={user.email}
            defaultName={user.name}
            defaultDepartment={user.department}
            defaultDesignation={user.designation}
            defaultOrganization={user.organization}
            theme={theme}
            onThemeChange={setTheme}
            mode={mode}
            onModeChange={setMode}
            singleParticipant={singleParticipant}
            onUpdateSingleParticipant={setSingleParticipant}
            groupParticipants={groupParticipants}
            onUpdateGroupParticipants={setGroupParticipants}
            signatory1Name={signatory1Name}
            onSignatory1NameChange={setSignatory1Name}
            signatory1Title={signatory1Title}
            onSignatory1TitleChange={setSignatory1Title}
            signatory2Name={signatory2Name}
            onSignatory2NameChange={setSignatory2Name}
            signatory2Title={signatory2Title}
            onSignatory2TitleChange={setSignatory2Title}
            organizationName={organizationName}
            onOrganizationNameChange={setOrganizationName}
            onBackToUpload={() => setCurrentStep('upload')}
            onProceedToDownload={() => setCurrentStep('certificate')}
          />
        )}

        {currentStep === 'certificate' && (
          <CertificateHub
            documents={documents}
            theme={theme}
            mode={mode}
            singleParticipant={singleParticipant}
            groupParticipants={groupParticipants}
            signatory1Name={signatory1Name}
            signatory1Title={signatory1Title}
            signatory2Name={signatory2Name}
            signatory2Title={signatory2Title}
            organizationName={organizationName}
            onBackToParticipants={() => setCurrentStep('participants')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif">
            AI-Workshop Submission portal • 9 Mandatory Statutory Modules
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <p className="font-mono text-[11px] text-slate-600">
              Isolated Workspace: <span className="text-sky-800 font-bold">{user.email}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
