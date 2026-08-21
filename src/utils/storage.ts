import { UserSession, UserWorkspaceData, AccountSummary, DocumentCategoryId, UploadedDocument, Participant, CertificateTheme } from '../types';
import { DOCUMENT_CATEGORIES } from '../data/categories';

const ACCOUNTS_INDEX_KEY = 'legal_portal_accounts_index';
const CURRENT_ACTIVE_EMAIL_KEY = 'legal_portal_active_user_email';
const DB_NAME = 'LegalPortalIndexedDB';
const DB_VERSION = 1;
const STORE_NAME = 'user_workspaces';

// In-memory cache for ultra-fast, non-blocking synchronous access
const memoryCache = new Map<string, UserWorkspaceData>();

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function getUserStorageKey(email: string): string {
  return `legal_portal_workspace_${normalizeEmail(email)}`;
}

// ----------------- IndexedDB Helpers -----------------
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveToIndexedDB(email: string, workspace: UserWorkspaceData): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record = { email: normalizeEmail(email), data: workspace };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Non-fatal, fallback continues
    console.warn('IndexedDB save skipped:', err);
  }
}

export async function getUserWorkspaceFromIndexedDB(email: string): Promise<UserWorkspaceData | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(normalizeEmail(email));
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data as UserWorkspaceData);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB load skipped:', err);
    return null;
  }
}

async function deleteFromIndexedDB(email: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(normalizeEmail(email));
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete skipped:', err);
  }
}

// ----------------- Storage Sanitizer -----------------
// Strip heavy base64 strings so localStorage stays well below quota (<10KB)
function sanitizeWorkspaceForLocalStorage(workspace: UserWorkspaceData): UserWorkspaceData {
  const sanitizedDocs: Record<DocumentCategoryId, UploadedDocument | null> = {} as any;

  if (workspace.documents) {
    for (const [key, doc] of Object.entries(workspace.documents)) {
      const catKey = key as DocumentCategoryId;
      if (doc) {
        sanitizedDocs[catKey] = {
          ...doc,
          // Remove large data URLs for localStorage; IndexedDB & memoryCache preserve full data
          fileDataUrl: undefined,
        };
      } else {
        sanitizedDocs[catKey] = null;
      }
    }
  }

  return {
    ...workspace,
    documents: sanitizedDocs,
  };
}

export function getActiveUserEmail(): string | null {
  try {
    return localStorage.getItem(CURRENT_ACTIVE_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function setActiveUserEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(CURRENT_ACTIVE_EMAIL_KEY, normalizeEmail(email));
    } else {
      localStorage.removeItem(CURRENT_ACTIVE_EMAIL_KEY);
    }
  } catch (e) {
    console.warn('Failed to set active email in localStorage', e);
  }
}

export function getAllAccounts(): AccountSummary[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAccountsIndex(accounts: AccountSummary[]): void {
  try {
    localStorage.setItem(ACCOUNTS_INDEX_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save accounts index to localStorage', e);
  }
}

export function createNewWorkspaceForUser(session: UserSession): UserWorkspaceData {
  const initialDocs: Partial<Record<DocumentCategoryId, UploadedDocument | null>> = {};
  DOCUMENT_CATEGORIES.forEach((cat) => {
    initialDocs[cat.id] = null;
  });

  const rawPrefix = normalizeEmail(session.email).split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
  const userSerialPrefix = rawPrefix.slice(0, 5) || 'ADM';
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const singleParticipant: Participant = {
    id: `single-${Date.now()}`,
    fullName: session.name,
    email: session.email,
    designation: session.designation || 'Senior Officer',
    department: session.department || 'Workshop & Operations Wing',
    organization: session.organization || 'AI Workshop Program',
    certificateNumber: `CERT-${userSerialPrefix}-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    issueDate,
    verificationCode: `VERIF-${userSerialPrefix}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
  };

  const groupParticipants: Participant[] = [
    {
      ...singleParticipant,
      id: `grp-1-${Date.now()}`,
      certificateNumber: `CERT-${userSerialPrefix}-GRP-001`,
    },
  ];

  return {
    user: session,
    documents: initialDocs as Record<DocumentCategoryId, UploadedDocument | null>,
    mode: 'individual',
    theme: 'gold',
    organizationName: 'AI Workshop Program',
    signatory1Name: 'Thiru . Vishu Mahajan I.A.S',
    signatory1Title: 'Authorized Signatory',
    signatory2Name: '',
    signatory2Title: '',
    singleParticipant,
    groupParticipants,
    customEmblemUrl: '',
    currentStep: 'upload',
    lastUpdated: new Date().toISOString(),
  };
}

export function getUserWorkspace(email: string): UserWorkspaceData | null {
  const normEmail = normalizeEmail(email);

  // 1. Check in-memory cache
  if (memoryCache.has(normEmail)) {
    return memoryCache.get(normEmail)!;
  }

  // 2. Check localStorage
  try {
    const key = getUserStorageKey(normEmail);
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as UserWorkspaceData;
      memoryCache.set(normEmail, parsed);
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load workspace from localStorage', e);
  }

  return null;
}

export function saveUserWorkspace(workspace: UserWorkspaceData): void {
  const email = normalizeEmail(workspace.user.email);
  const key = getUserStorageKey(email);
  workspace.lastUpdated = new Date().toISOString();

  // 1. Always update memory cache synchronously
  memoryCache.set(email, workspace);

  // 2. Asynchronously persist complete workspace (with files) in IndexedDB
  saveToIndexedDB(email, workspace).catch(() => {});

  // 3. Persist sanitized, lightweight copy to localStorage (<10KB)
  try {
    const sanitized = sanitizeWorkspaceForLocalStorage(workspace);
    localStorage.setItem(key, JSON.stringify(sanitized));

    // Update Accounts Index
    const accounts = getAllAccounts();
    const uploadedCount = Object.values(workspace.documents || {}).filter(Boolean).length;
    const participantsCount =
      workspace.mode === 'individual' ? 1 : (workspace.groupParticipants?.length || 0);

    const existingIndex = accounts.findIndex((a) => normalizeEmail(a.email) === email);
    const summary: AccountSummary = {
      email,
      name: workspace.user.name,
      avatar: workspace.user.avatar,
      uploadedCount,
      participantsCount,
      lastActive: new Date().toISOString(),
      mode: workspace.mode,
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = summary;
    } else {
      accounts.unshift(summary);
    }

    saveAccountsIndex(accounts);
  } catch (e) {
    // If localStorage quota error still occurs (e.g. device full), prevent app crash
    console.warn('LocalStorage save failed, cached in memory & IndexedDB:', e);
  }
}

export function removeAccount(email: string): void {
  const norm = normalizeEmail(email);
  memoryCache.delete(norm);
  deleteFromIndexedDB(norm).catch(() => {});

  try {
    localStorage.removeItem(getUserStorageKey(norm));
    const accounts = getAllAccounts().filter((a) => normalizeEmail(a.email) !== norm);
    saveAccountsIndex(accounts);
    if (getActiveUserEmail() === norm) {
      setActiveUserEmail(null);
    }
  } catch (e) {
    console.warn('Failed to delete account from localStorage', e);
  }
}
