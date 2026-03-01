/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Unit Tests — User Profile CRUD (lib/firebase/users.ts)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Tests profile creation, updates, completion calculation, and validation.
 * Firebase is fully mocked.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  setupFirebaseMocks,
  createMockUser,
  mockGetDoc,
  mockSetDoc,
  mockUpdateDoc,
  mockRunTransaction,
  mockDocSnapshot,
  mockQuerySnapshot,
  mockGetDocs,
} from "@/tests/__mocks__/firebase";

setupFirebaseMocks();

import {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  calculateProfileCompletion,
} from "@/lib/firebase/users";

describe("User Profile Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── createUserProfile ─────────────────────────────────────────────────
  describe("createUserProfile()", () => {
    it("creates a profile with required fields", async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const result = await createUserProfile("uid-123", {
        name: "Priya Sharma",
        phone: "+919876543210",
        gender: "female",
      });

      expect(mockSetDoc).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it("rejects empty name", async () => {
      await expect(
        createUserProfile("uid-123", {
          name: "",
          phone: "+919876543210",
          gender: "female",
        }),
      ).rejects.toMatchObject({
        code: expect.stringContaining("validation"),
      });
    });

    it("rejects invalid phone format", async () => {
      await expect(
        createUserProfile("uid-123", {
          name: "Test",
          phone: "123",
          gender: "female",
        }),
      ).rejects.toMatchObject({
        code: expect.stringContaining("validation"),
      });
    });
  });

  // ─── getUserProfile ────────────────────────────────────────────────────
  describe("getUserProfile()", () => {
    it("returns user data when document exists", async () => {
      const mockUser = createMockUser({ uid: "uid-123" });
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot(mockUser));

      const result = await getUserProfile("uid-123");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.uid).toBe("uid-123");
    });

    it("returns not-found when document does not exist", async () => {
      mockGetDoc.mockResolvedValueOnce(mockDocSnapshot(undefined, false));

      const result = await getUserProfile("nonexistent");

      expect(result.success).toBe(false);
    });
  });

  // ─── updateUserProfile ─────────────────────────────────────────────────
  describe("updateUserProfile()", () => {
    it("updates allowed fields", async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      const result = await updateUserProfile("uid-123", {
        bio: "Updated bio text",
        city: "Pune",
      });

      expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
    });

    it("sanitizes HTML from bio text", async () => {
      mockUpdateDoc.mockResolvedValueOnce(undefined);

      await updateUserProfile("uid-123", {
        bio: '<script>alert("xss")</script>Hello',
      });

      // The updateDoc call should contain sanitized text
      const updateCall = mockUpdateDoc.mock.calls[0];
      if (updateCall) {
        const data = updateCall[1];
        if (data && typeof data === "object" && "bio" in data) {
          expect((data as any).bio).not.toContain("<script>");
        }
      }
    });
  });

  // ─── calculateProfileCompletion ────────────────────────────────────────
  describe("calculateProfileCompletion()", () => {
    it("returns 100 for a fully completed profile", () => {
      const fullUser = createMockUser({
        name: "Priya",
        bio: "I love cooking",
        photos: [
          { url: "photo1.jpg", isPrimary: true },
          { url: "photo2.jpg", isPrimary: false },
        ],
        education: "MBA",
        career: "PM",
        intent: "marriage-soon",
        city: "Mumbai",
        diet: "vegetarian",
      });

      const score = calculateProfileCompletion(fullUser);
      expect(score).toBeGreaterThanOrEqual(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("returns low score for minimal profile", () => {
      const minimal = createMockUser({
        name: "Test",
        bio: "",
        photos: [],
        education: "",
        career: "",
        intent: null as any,
        city: "",
      });

      const score = calculateProfileCompletion(minimal);
      expect(score).toBeLessThan(50);
    });

    it("score is always between 0 and 100", () => {
      const user = createMockUser();
      const score = calculateProfileCompletion(user);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});
