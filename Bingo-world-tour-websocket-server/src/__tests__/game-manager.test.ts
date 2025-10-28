import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameManager } from "../game-manager";

// Mock Prisma
vi.mock("../utils/prisma", () => ({
  prisma: {
    gameSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    location: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    revealedLocation: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { prisma } from "../utils/prisma";

describe("GameManager", () => {
  let gameManager: GameManager;

  beforeEach(() => {
    gameManager = new GameManager();
    vi.clearAllMocks();
  });

  it("should start a game successfully", async () => {
    const mockSession = {
      id: "session1",
      code: "ABC123",
      status: "ACTIVE",
      startedAt: new Date(),
      revealInterval: 5,
      currentRevealIndex: 0,
      maxReveals: 50,
      revealedLocations: [],
    };

    (prisma.gameSession.findUnique as any).mockResolvedValue(mockSession);
    (prisma.location.findMany as any).mockResolvedValue([{ id: "loc1" }, { id: "loc2" }]);

    const game = await gameManager.startGame("ABC123");

    expect(game).toBeDefined();
    expect(game.code).toBe("ABC123");
    expect(prisma.gameSession.findUnique).toHaveBeenCalled();
  });

  it("should throw error for invalid session", async () => {
    (prisma.gameSession.findUnique as any).mockResolvedValue(null);

    await expect(gameManager.startGame("INVALID")).rejects.toThrow("Invalid session");
  });

  it("should reveal next location", async () => {
    const mockGame = {
      sessionId: "session1",
      code: "ABC123",
      revealInterval: 5,
      startedAt: new Date(),
      timer: null,
      currentRevealIndex: 0,
      maxReveals: 50,
      allLocationIds: ["loc1", "loc2"],
      clients: new Set(),
    };

    (gameManager as any).activeGames.set("ABC123", mockGame);
    (prisma.revealedLocation.findMany as any).mockResolvedValue([]);
    (prisma.revealedLocation.create as any).mockResolvedValue({});
    (prisma.location.findUnique as any).mockResolvedValue({ id: "loc1", name: "Location 1" });

    // Mock Math.random to always pick first
    vi.spyOn(Math, 'random').mockReturnValue(0);

    await (gameManager as any).revealNextLocation(mockGame);

    expect(prisma.revealedLocation.create).toHaveBeenCalled();
    expect(mockGame.currentRevealIndex).toBe(1);

    vi.restoreAllMocks();
  });
});