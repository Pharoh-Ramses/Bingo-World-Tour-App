import { describe, it, expect, vi } from "vitest";
import { handleWebSocket } from "../websocket-handler";

// Mock dependencies
vi.mock("../utils/prisma", () => ({
  prisma: {
    gameSession: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../game-manager", () => ({
  GameManager: vi.fn().mockImplementation(() => ({
    addClient: vi.fn(),
    getGame: vi.fn(),
    startGame: vi.fn(),
  })),
}));

import { prisma } from "../utils/prisma";
import { GameManager } from "../game-manager";

describe("WebSocket Handler", () => {
  it("should handle valid connection", async () => {
    const mockSession = {
      id: "session1",
      code: "ABC123",
      status: "ACTIVE",
      revealedLocations: [],
    };

    (prisma.gameSession.findUnique as any).mockResolvedValue(mockSession);

    const gameManager = new GameManager();
    const handler = handleWebSocket(gameManager);

    const mockWs = {
      data: { code: "ABC123" },
      send: vi.fn(),
      close: vi.fn(),
    };

    await handler.open(mockWs as any);

    expect(prisma.gameSession.findUnique).toHaveBeenCalledWith({
      where: { code: "ABC123" },
      include: { revealedLocations: { include: { location: true }, orderBy: { revealIndex: 'asc' } } },
    });
    expect(mockWs.send).toHaveBeenCalled();
  });

  it("should handle invalid session", async () => {
    (prisma.gameSession.findUnique as any).mockResolvedValue(null);

    const gameManager = new GameManager();
    const handler = handleWebSocket(gameManager);

    const mockWs = {
      data: { code: "INVALID" },
      send: vi.fn(),
      close: vi.fn(),
    };

    await handler.open(mockWs as any);

    expect(mockWs.send).toHaveBeenCalledWith(
      JSON.stringify({ type: "error", message: "Invalid session code" })
    );
    expect(mockWs.close).toHaveBeenCalled();
  });
});