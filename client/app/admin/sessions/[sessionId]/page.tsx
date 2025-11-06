"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/lib/useWebSocket";
import { WSIncomingMessage } from "@/lib/websocket-types";

interface GameSession {
    id: string;
    code: string;
    status: "WAITING" | "STARTING" | "ACTIVE" | "PAUSED" | "ENDED";
    revealInterval: number;
    currentRevealIndex: number;
    maxReveals: number;
    playerCount: number;
    createdAt: string;
    startedAt?: string;
    endedAt?: string;
    players: Array<{
        id: string;
        name: string;
        isReady: boolean;
    }>;
}

interface RevealedLocation {
    id: string;
    locationId: string;
    locationName: string;
    revealIndex: number;
    revealedAt: string;
}

const SessionControlPanel = () => {
    const params = useParams();
    const router = useRouter();
    const {} = useUser();
    const sessionId = params.sessionId as string;

    const [session, setSession] = useState<GameSession | null>(null);
    const [revealedLocations, setRevealedLocations] = useState<
        RevealedLocation[]
    >([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStarting, setIsStarting] = useState(false);
    const [isPausing, setIsPausing] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const [wsSessionCode, setWsSessionCode] = useState<string | null>(null);
    const [startError, setStartError] = useState<string | null>(null);

    const fetchSessionData = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/sessions/${sessionId}`);
            if (response.ok) {
                const data = await response.json();
                setSession(data.session);
                setRevealedLocations(data.revealedLocations || []);
                setWsSessionCode(data.session.code);
            }
        } catch (error) {
            console.error("Failed to fetch session data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    // WebSocket message handler
    const handleWebSocketMessage = useCallback(
        (message: WSIncomingMessage) => {
            console.log(
                "Admin page received WebSocket message:",
                message.type,
                message,
            );

            switch (message.type) {
                case "connected":
                    // Initialize revealed locations from server data
                    if (
                        message.data.revealedLocations &&
                        Array.isArray(message.data.revealedLocations)
                    ) {
                        setRevealedLocations(message.data.revealedLocations);
                    }
                    setSession((prev) =>
                        prev ? { ...prev, status: message.data.status } : null,
                    );
                    break;

                case "location-revealed":
                    // Add new revealed location (server now includes revealIndex and revealedAt)
                    const newRevealedLocation: RevealedLocation = {
                        id: `revealed-${message.data.id}-${message.data.revealIndex || revealedLocations.length + 1}`,
                        locationId: message.data.id,
                        locationName: message.data.name,
                        revealIndex:
                            message.data.revealIndex ||
                            revealedLocations.length + 1,
                        revealedAt:
                            message.data.revealedAt || new Date().toISOString(),
                    };
                    setRevealedLocations((prev) => [
                        ...prev,
                        newRevealedLocation,
                    ]);
                    break;

                case "game-paused":
                    setSession((prev) =>
                        prev ? { ...prev, status: "PAUSED" } : null,
                    );
                    break;

                case "game-resumed":
                    setSession((prev) =>
                        prev ? { ...prev, status: "ACTIVE" } : null,
                    );
                    break;

                case "game-ended":
                    setSession((prev) =>
                        prev ? { ...prev, status: "ENDED" } : null,
                    );
                    break;

                case "winner-found":
                    console.log("Winner found:", message.data);
                    break;

                case "player-joined":
                    console.log("Admin: Player joined:", message.data);
                    setSession((prev) => {
                        if (!prev) return null;
                        // Check if player already exists to avoid duplicates
                        const playerExists = prev.players.some(
                            (p) => p.id === message.data.userId,
                        );
                        if (playerExists) {
                            // Update existing player
                            return {
                                ...prev,
                                players: prev.players.map((p) =>
                                    p.id === message.data.userId
                                        ? {
                                              ...p,
                                              name:
                                                  message.data.userName ||
                                                  p.name,
                                              isReady:
                                                  message.data.isReady ||
                                                  p.isReady,
                                          }
                                        : p,
                                ),
                            };
                        }
                        // Add new player
                        return {
                            ...prev,
                            players: [
                                ...prev.players,
                                {
                                    id: message.data.userId,
                                    name: message.data.userName || "Anonymous",
                                    isReady: message.data.isReady || false,
                                },
                            ],
                            playerCount: prev.playerCount + 1,
                        };
                    });
                    break;

                case "player-ready":
                    console.log("Admin: Player ready:", message.data);
                    setSession((prev) => {
                        if (!prev) return null;
                        // Update player ready status
                        const playerExists = prev.players.some(
                            (p) => p.id === message.data.userId,
                        );
                        if (playerExists) {
                            return {
                                ...prev,
                                players: prev.players.map((p) =>
                                    p.id === message.data.userId
                                        ? {
                                              ...p,
                                              name:
                                                  message.data.userName ||
                                                  p.name,
                                              isReady:
                                                  message.data.isReady !==
                                                  undefined
                                                      ? message.data.isReady
                                                      : p.isReady,
                                          }
                                        : p,
                                ),
                            };
                        }
                        // Add new player if they don't exist
                        return {
                            ...prev,
                            players: [
                                ...prev.players,
                                {
                                    id: message.data.userId,
                                    name: message.data.userName || "Anonymous",
                                    isReady: message.data.isReady || false,
                                },
                            ],
                            playerCount: prev.playerCount + 1,
                        };
                    });
                    break;

                case "player-left":
                    console.log("Admin: Player left:", message.data);
                    setSession((prev) => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            players: prev.players.filter(
                                (p) => p.id !== message.data.userId,
                            ),
                            playerCount: Math.max(0, prev.playerCount - 1),
                        };
                    });
                    break;
            }
        },
        [revealedLocations.length],
    );

    // WebSocket connection
    const { connectionState, send } = useWebSocket({
        sessionCode: wsSessionCode || "",
        onMessage: handleWebSocketMessage,
        onError: (error) => console.error("WebSocket error:", error),
    });

    useEffect(() => {
        if (sessionId) {
            fetchSessionData();
        }
    }, [sessionId, fetchSessionData]);

    const handleStartGame = async () => {
        setIsStarting(true);
        setStartError(null);
        try {
            const response = await fetch(
                `/api/admin/sessions/${sessionId}/start`,
                {
                    method: "POST",
                },
            );

            if (response.ok) {
                await fetchSessionData();
            } else {
                const data = await response.json();
                setStartError(data.error || "Failed to start game");
            }
        } catch (error) {
            console.error("Failed to start game:", error);
            setStartError("Failed to start game. Please try again.");
        } finally {
            setIsStarting(false);
        }
    };

    const handlePauseGame = () => {
        setIsPausing(true);
        send({ type: "pause" });
        // Reset loading state after a short delay
        setTimeout(() => setIsPausing(false), 1000);
    };

    const handleResumeGame = () => {
        setIsPausing(true);
        send({ type: "resume" });
        // Reset loading state after a short delay
        setTimeout(() => setIsPausing(false), 1000);
    };

    const handleEndGame = () => {
        setIsEnding(true);
        send({ type: "end" });
        // Reset loading state after a short delay
        setTimeout(() => setIsEnding(false), 1000);
    };

    const handleManualReveal = () => {
        send({ type: "manual-reveal" });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "WAITING":
                return "bg-accent-sand text-tertiary-600";
            case "STARTING":
                return "bg-warning text-white";
            case "ACTIVE":
                return "bg-success text-white";
            case "PAUSED":
                return "bg-warning text-white";
            case "ENDED":
                return "bg-neutral-400 text-white";
            default:
                return "bg-neutral-300 text-tertiary-600";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "WAITING":
                return "Waiting for Players";
            case "STARTING":
                return "Starting Soon";
            case "ACTIVE":
                return "Game Active";
            case "PAUSED":
                return "Game Paused";
            case "ENDED":
                return "Game Ended";
            default:
                return status;
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-20 py-6 sm:py-16">
                <div className="text-center">
                    <p className="body-1 text-tertiary-300">
                        Loading session...
                    </p>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-20 py-6 sm:py-16">
                <div className="text-center">
                    <p className="body-1 text-tertiary-300">
                        Session not found
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/admin")}
                        className="mt-4"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-20 py-4 sm:py-8 lg:py-16">
            <div className="space-y-4 sm:space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <h1 className="heading-3 sm:heading-2 lg:heading-1 text-tertiary-500">
                                Session
                            </h1>
                            <span
                                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-tertiary-500"
                                style={{ fontFamily: "var(--font-dm-sans)" }}
                            >
                                {session.code}
                            </span>
                        </div>
                        <p className="body-3 sm:body-2 lg:body-1 text-tertiary-300 mt-1 sm:mt-2">
                            Manage your BINGO World Tour game session
                        </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                        <Badge className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                        </Badge>
                        <Badge
                            data-testid="connection-status"
                            className={`${
                                connectionState === "connected"
                                    ? "bg-success text-white"
                                    : connectionState === "connecting"
                                      ? "bg-warning text-white"
                                      : "bg-error text-white"
                            }`}
                        >
                            {connectionState === "connected"
                                ? "Connected"
                                : connectionState === "connecting"
                                  ? "Connecting..."
                                  : "Disconnected"}
                        </Badge>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin")}
                            size="sm"
                            className="hidden sm:flex"
                        >
                            Back to Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin")}
                            size="sm"
                            className="sm:hidden"
                        >
                            Back
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                    {/* Session Info */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-6">
                        {/* Game Controls */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="heading-4 sm:heading-3 text-tertiary-500">
                                    Game Controls
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                                {startError && (
                                    <div className="p-4 bg-error-100 border border-error-300 rounded-lg">
                                        <p className="body-2 text-error-600">
                                            {startError}
                                        </p>
                                    </div>
                                )}

                                {session.status === "WAITING" && (
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleStartGame}
                                            disabled={
                                                isStarting ||
                                                session.playerCount === 0
                                            }
                                            className="flex-1"
                                        >
                                            {isStarting
                                                ? "Starting..."
                                                : "Start Game"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleEndGame}
                                            disabled={isEnding}
                                        >
                                            {isEnding
                                                ? "Ending..."
                                                : "Cancel Session"}
                                        </Button>
                                    </div>
                                )}

                                {session.status === "ACTIVE" && (
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={handlePauseGame}
                                            disabled={isPausing}
                                            className="text-xs sm:text-sm"
                                        >
                                            {isPausing
                                                ? "Pausing..."
                                                : "Pause Game"}
                                        </Button>
                                        <Button
                                            variant="primary"
                                            onClick={handleManualReveal}
                                            className="text-xs sm:text-sm"
                                        >
                                            Reveal Next
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleEndGame}
                                            disabled={isEnding}
                                            className="text-xs sm:text-sm"
                                        >
                                            {isEnding
                                                ? "Ending..."
                                                : "End Game"}
                                        </Button>
                                    </div>
                                )}

                                {session.status === "PAUSED" && (
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <Button
                                            variant="primary"
                                            onClick={handleResumeGame}
                                            disabled={isPausing}
                                            className="flex-1"
                                        >
                                            {isPausing
                                                ? "Resuming..."
                                                : "Resume Game"}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={handleEndGame}
                                            disabled={isEnding}
                                        >
                                            {isEnding
                                                ? "Ending..."
                                                : "End Game"}
                                        </Button>
                                    </div>
                                )}

                                {session.status === "ENDED" && (
                                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                        <Button
                                            variant="primary"
                                            onClick={() =>
                                                router.push(
                                                    `/game/${session.code}/results`,
                                                )
                                            }
                                            className="flex-1"
                                        >
                                            View Results
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Revealed Locations */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="heading-4 sm:heading-3 text-tertiary-500">
                                    Revealed Locations (
                                    {revealedLocations.length})
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Locations that have been revealed during
                                    this game
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                {revealedLocations.length === 0 ? (
                                    <p className="body-2 sm:body-1 text-tertiary-300 text-center py-6 sm:py-8">
                                        No locations revealed yet
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                                        {revealedLocations.map((location) => (
                                            <div
                                                key={location.id}
                                                className="p-2 sm:p-3 bg-primary-100 rounded-lg border border-primary-300"
                                            >
                                                <p className="body-3 sm:body-2 text-tertiary-600 font-medium">
                                                    #{location.revealIndex}
                                                </p>
                                                <p className="body-4 sm:body-3 text-tertiary-500 truncate">
                                                    {location.locationName}
                                                </p>
                                                <p className="text-[10px] sm:body-4 text-tertiary-400">
                                                    {new Date(
                                                        location.revealedAt,
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-3 sm:space-y-6">
                        {/* Session Details */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="heading-5 sm:heading-4 text-tertiary-500">
                                    Session Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 sm:space-y-3 p-4 sm:p-6">
                                <div>
                                    <p className="body-3 text-tertiary-400">
                                        Session Code
                                    </p>
                                    <p className="body-2 text-tertiary-600 font-mono">
                                        {session.code}
                                    </p>
                                </div>
                                <div>
                                    <p className="body-3 text-tertiary-400">
                                        Reveal Interval
                                    </p>
                                    <p className="body-2 text-tertiary-600">
                                        {session.revealInterval} minutes
                                    </p>
                                </div>
                                <div>
                                    <p className="body-3 text-tertiary-400">
                                        Players
                                    </p>
                                    <p className="body-2 text-tertiary-600">
                                        {session.playerCount} joined
                                    </p>
                                </div>
                                <div>
                                    <p className="body-3 text-tertiary-400">
                                        Created
                                    </p>
                                    <p className="body-2 text-tertiary-600">
                                        {new Date(
                                            session.createdAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Players List */}
                        <Card>
                            <CardHeader className="p-4 sm:p-6">
                                <CardTitle className="heading-5 sm:heading-4 text-tertiary-500">
                                    Players ({session.players.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6">
                                {session.players.length === 0 ? (
                                    <p className="body-2 text-tertiary-300 text-center py-4">
                                        No players joined yet
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {session.players.map((player) => (
                                            <div
                                                key={player.id}
                                                className="flex items-center justify-between p-2 bg-neutral-50 rounded"
                                            >
                                                <span className="body-2 text-tertiary-600">
                                                    {player.name}
                                                </span>
                                                <Badge
                                                    className={
                                                        player.isReady
                                                            ? "bg-success text-white"
                                                            : "bg-accent-sand text-tertiary-600"
                                                    }
                                                >
                                                    {player.isReady
                                                        ? "Ready"
                                                        : "Setting up"}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionControlPanel;
