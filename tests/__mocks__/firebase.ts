/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Bandhan AI — Firebase Mock Infrastructure
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Centralized mocks for all Firebase services used in tests.
 * Import and call `setupFirebaseMocks()` at the top of any test file
 * that touches Firebase.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type { UserDocument, MatchDocument, MessageDocument } from "@/lib/firebase/schema";

// ─── Firestore Mock ──────────────────────────────────────────────────────────

export const mockDoc = jest.fn();
export const mockGetDoc = jest.fn();
export const mockGetDocs = jest.fn();
export const mockSetDoc = jest.fn();
export const mockAddDoc = jest.fn();
export const mockUpdateDoc = jest.fn();
export const mockDeleteDoc = jest.fn();
export const mockCollection = jest.fn();
export const mockQuery = jest.fn();
export const mockWhere = jest.fn();
export const mockOrderBy = jest.fn();
export const mockLimit = jest.fn();
export const mockRunTransaction = jest.fn();
export const mockOnSnapshot = jest.fn();
export const mockWriteBatch = jest.fn();
export const mockServerTimestamp = jest.fn(() => ({ _type: "serverTimestamp" }));
export const mockDocumentId = jest.fn(() => "__name__");

// ─── Auth Mock ───────────────────────────────────────────────────────────────

export const mockSignInWithPhoneNumber = jest.fn();
export const mockRecaptchaVerifier = jest.fn();
export const mockGoogleAuthProvider = jest.fn();
export const mockSignInWithPopup = jest.fn();
export const mockSignOut = jest.fn();
export const mockOnAuthStateChanged = jest.fn();

// ─── Storage Mock ────────────────────────────────────────────────────────────

export const mockRef = jest.fn();
export const mockUploadBytes = jest.fn();
export const mockGetDownloadURL = jest.fn();
export const mockDeleteObject = jest.fn();

// ─── Firebase Config Mock ────────────────────────────────────────────────────

export const mockFirebaseAuth = {} as any;
export const mockFirebaseDb = {} as any;
export const mockFirebaseStorage = {} as any;

// ─── Setup function ──────────────────────────────────────────────────────────

export function setupFirebaseMocks() {
  // Mock config module
  jest.mock("@/lib/firebase/config", () => ({
    firebaseAuth: mockFirebaseAuth,
    firebaseDb: mockFirebaseDb,
    firebaseStorage: mockFirebaseStorage,
    firebaseApp: {} as any,
    isDemoMode: jest.fn(() => true),
    isFirebaseConfigured: jest.fn(() => false),
  }));

  // Mock Firestore
  jest.mock("firebase/firestore", () => ({
    doc: mockDoc,
    getDoc: mockGetDoc,
    getDocs: mockGetDocs,
    setDoc: mockSetDoc,
    addDoc: mockAddDoc,
    updateDoc: mockUpdateDoc,
    collection: mockCollection,
    query: mockQuery,
    where: mockWhere,
    orderBy: mockOrderBy,
    limit: mockLimit,
    runTransaction: mockRunTransaction,
    onSnapshot: mockOnSnapshot,
    writeBatch: mockWriteBatch,
    serverTimestamp: mockServerTimestamp,
    documentId: mockDocumentId,
    deleteField: jest.fn(),
    startAfter: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ toMillis: () => Date.now(), toDate: () => new Date() })),
      fromDate: jest.fn((d: Date) => ({ toMillis: () => d.getTime(), toDate: () => d })),
    },
  }));

  // Mock Firebase Auth
  jest.mock("firebase/auth", () => ({
    signInWithPhoneNumber: mockSignInWithPhoneNumber,
    RecaptchaVerifier: mockRecaptchaVerifier,
    GoogleAuthProvider: mockGoogleAuthProvider,
    signInWithPopup: mockSignInWithPopup,
    signOut: mockSignOut,
    onAuthStateChanged: mockOnAuthStateChanged,
  }));

  // Mock Firebase Storage
  jest.mock("firebase/storage", () => ({
    ref: mockRef,
    uploadBytes: mockUploadBytes,
    getDownloadURL: mockGetDownloadURL,
    deleteObject: mockDeleteObject,
  }));
}

// ─── Factory Helpers ─────────────────────────────────────────────────────────

/** Create a mock Firestore document snapshot */
export function mockDocSnapshot<T>(data: T | undefined, exists = true) {
  return {
    exists: () => (data ? exists : false),
    data: () => data,
    id: (data as any)?.uid ?? "mock-doc-id",
    ref: { id: (data as any)?.uid ?? "mock-doc-id" },
  };
}

/** Create a mock Firestore query snapshot */
export function mockQuerySnapshot<T>(docs: T[]) {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs: docs.map((d, i) => ({
      id: (d as any)?.uid ?? `doc-${i}`,
      data: () => d,
      exists: () => true,
      ref: { id: (d as any)?.uid ?? `doc-${i}` },
    })),
    forEach: (cb: (doc: any) => void) => {
      docs.forEach((d, i) =>
        cb({
          id: (d as any)?.uid ?? `doc-${i}`,
          data: () => d,
          exists: () => true,
          ref: { id: (d as any)?.uid ?? `doc-${i}` },
        }),
      );
    },
  };
}

// ─── Test Data Factories ─────────────────────────────────────────────────────

let idCounter = 0;
function nextId() {
  return `test-${++idCounter}`;
}

export function createMockUser(overrides: Partial<UserDocument> = {}): UserDocument {
  const uid = overrides.uid ?? nextId();
  return {
    uid,
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+919876543210",
    gender: "female",
    dateOfBirth: "1998-05-15",
    age: 27,
    city: "Mumbai",
    state: "Maharashtra",
    bio: "Love cooking and traveling",
    intent: "marriage-soon",
    photos: [{ url: "https://example.com/photo.jpg", isPrimary: true }],
    education: "MBA",
    college: "IIM Bangalore",
    career: "Product Manager",
    company: "TechCorp",
    annualIncome: "15-25 LPA",
    height: "5'5\"",
    motherTongue: "Hindi",
    religion: "Hindu",
    caste: null,
    gotra: null,
    manglik: false,
    familyType: "nuclear",
    fatherOccupation: "Business",
    motherOccupation: "Homemaker",
    siblings: "1 brother",
    diet: "vegetarian",
    smoking: "never",
    drinking: "occasionally",
    verificationLevel: "bronze",
    isPremium: false,
    profileCompletion: 85,
    preferences: {
      ageRange: { min: 25, max: 35 },
      locations: ["Mumbai", "Pune"],
      diets: ["vegetarian", "eggetarian"],
      intents: ["marriage-soon", "serious-relationship"],
    },
    dealbreakers: {
      smoking: "non-negotiable",
      drinking: "okay-occasionally",
      diet: "strict-veg",
      familyValues: "traditional",
      relocation: "open-discuss",
    },
    privacy: {
      showOnlineStatus: true,
      showProfileVisits: true,
      showReadReceipts: true,
      showLastSeen: true,
      showDistance: true,
    },
    prompts: [],
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    lastActiveAt: "2025-01-01T00:00:00.000Z",
    isOnline: true,
    isBlocked: false,
    isSuspended: false,
    reportCount: 0,
    ...overrides,
  } as UserDocument;
}

export function createMockMatch(overrides: Partial<MatchDocument> = {}): MatchDocument {
  return {
    user1Id: "user-1",
    user2Id: "user-2",
    matchedAt: "2025-06-15T10:00:00.000Z",
    status: "active",
    lastMessageAt: null,
    lastMessagePreview: null,
    user1UnreadCount: 0,
    user2UnreadCount: 0,
    ...overrides,
  } as MatchDocument;
}

export function createMockMessage(overrides: Partial<MessageDocument> = {}): MessageDocument {
  return {
    matchId: "match-1",
    senderId: "user-1",
    content: "Hello! 😊",
    type: "text",
    deliveryStatus: "sent",
    readAt: null,
    deletedAt: null,
    reportedAt: null,
    createdAt: "2025-06-15T10:00:00.000Z",
    ...overrides,
  } as MessageDocument;
}
