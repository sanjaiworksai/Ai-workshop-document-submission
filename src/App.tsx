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
  const [organizationName, setOrganizationName] = useState('AI Workshop Program');
  const [signatory1Name, setSignatory1Name] = useState('Thiru . Vishu Mahajan I.A.S');
  const [signatory1Title, setSignatory1Title] = useState('Authorized Signatory');
  const [signatory2Name, setSignatory2Name] = useState('');
  const [signatory2Title, setSignatory2Title] = useState('');

  // Single Candidate Details
  const [singleParticipant, setSingleParticipant] = useState<Participant>({
    id: 'single-init',
    fullName: '',
    email: '',
    designation: 'Officer / Participant',
    department: 'Technical & Administrative Wing',
    organization: 'AI Workshop Program',
    certificateNumber: `CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    issueDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    verificationCode: `VERIF-ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
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
    } else {
      // Whenever user logs in, ensure the newly provided email & name are immediately reflected
      if (session.name && session.name.trim()) {
        ws.user = {
          ...ws.user,
          email: session.email,
          name: session.name,
          loginAt: session.loginAt || new Date().toISOString(),
          avatar: session.avatar || ws.user.avatar,
        };
        ws.singleParticipant = {
          ...ws.singleParticipant,
          fullName: session.name,
          email: session.email,
        };
        if (ws.groupParticipants && ws.groupParticipants.length > 0) {
          ws.groupParticipants[0] = {
            ...ws.groupParticipants[0],
            fullName: session.name,
            email: session.email,
          };
        }
      }
      // Migrate legacy organization names
      if (!ws.organizationName || ws.organizationName.includes('Directorate') || ws.organizationName.includes('State Administrative')) {
        ws.organizationName = 'AI Workshop Program';
        ws.singleParticipant.organization = 'AI Workshop Program';
      }
    }

    saveUserWorkspace(ws);

    setUser(ws.user);
    setDocuments(ws.documents);
    setMode(ws.mode);
    setTheme(ws.theme);
    setOrganizationName(ws.organizationName || 'AI Workshop Program');
    setSignatory1Name(ws.signatory1Name || 'Thiru . Vishu Mahajan I.A.S');
    setSignatory1Title(ws.signatory1Title || 'Authorized Signatory');
    setSignatory2Name(ws.signatory2Name || '');
    setSignatory2Title(ws.signatory2Title || '');
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

  const handleLogout = () => {
    setActiveUserEmail(null);
    setUser(null);
    setDocuments(() => {
      const initial: Partial<Record<DocumentCategoryId, UploadedDocument | null>> = {};
      DOCUMENT_CATEGORIES.forEach((cat) => {
        initial[cat.id] = null;
      });
      return initial as Record<DocumentCategoryId, UploadedDocument | null>;
    });
    setSingleParticipant({
      id: 'single-init',
      fullName: '',
      email: '',
      designation: 'Officer / Participant',
      department: 'Technical & Administrative Wing',
      organization: 'AI Workshop Program',
      certificateNumber: `CERT-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      issueDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      verificationCode: `VERIF-ADM-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    });
    setGroupParticipants([]);
    setCurrentStep('upload');
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

  const handleStepChange = (nextStep: 'upload' | 'participants' | 'certificate') => {
    if ((nextStep === 'participants' || nextStep === 'certificate') && uploadedCount < totalCount) {
      setCurrentStep('upload');
      return;
    }
    setCurrentStep(nextStep);
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] bg-[radial-gradient(ellipse_100%_40%_at_50%_0%,rgba(219,234,254,0.45),rgba(244,247,251,1))] text-slate-800 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Header with Multi-User Isolation & Stepper */}
      <Header
        user={user}
        currentStep={currentStep}
        onStepChange={handleStepChange}
        uploadedCount={uploadedCount}
        totalCount={totalCount}
        onLogout={handleLogout}
      />

      {/* Main Content Area based on current Step */}
      <main className="flex-1">
        {currentStep === 'upload' && (
          <DocumentUploadPortal
            documents={documents}
            onUpdateDocument={handleUpdateDocument}
            onProceedToParticipants={() => {
              handleStepChange('participants');
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
            onProceedToDownload={() => handleStepChange('certificate')}
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
      <footer className="bg-white/80 border-t border-slate-200/90 py-6 text-center text-xs text-slate-500 mt-12 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-serif text-slate-700 font-medium">
            AI-Workshop Statutory Completion Portal • 9 Mandatory Statutory Modules
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="font-mono text-[11px] text-slate-600">
              Isolated Workspace: <span className="text-indigo-700 font-bold">{user.email}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
