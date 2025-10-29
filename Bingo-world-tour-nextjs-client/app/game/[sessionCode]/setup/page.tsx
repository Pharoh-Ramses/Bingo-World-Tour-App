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

interface Location {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
}

interface GameSession {
  id: string;
  code: string;
  status: "WAITING" | "STARTING" | "ACTIVE" | "PAUSED" | "ENDED";
  revealInterval: number;
  playerCount: number;
}

const BoardSetupPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const sessionCode = params.sessionCode as string;

  const [session, setSession] = useState<GameSession | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [boardLayout, setBoardLayout] = useState<(string | null)[]>(
    new Array(25).fill(null),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "category">(
    "name-asc",
  );
  const [hidePlaced, setHidePlaced] = useState<boolean>(false);

  const fetchSessionAndLocations = useCallback(async () => {
    try {
      // Fetch session status
      const sessionResponse = await fetch(`/api/game/${sessionCode}/status`);
      if (!sessionResponse.ok) {
        setError("Session not found");
        return;
      }
      const sessionData = await sessionResponse.json();
      setSession(sessionData);

      // Fetch all available locations
      const locationsResponse = await fetch("/api/locations");
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json();
        setLocations(locationsData.locations);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load game data");
    } finally {
      setIsLoading(false);
    }
  }, [sessionCode]);

  useEffect(() => {
    if (isLoaded && user && sessionCode) {
      fetchSessionAndLocations();
    } else if (isLoaded && !user) {
      router.push("/sign-in");
    }
  }, [isLoaded, user, sessionCode, router, fetchSessionAndLocations]);

  const handleLocationSelect = (locationId: string) => {
    if (selectedLocations.includes(locationId)) {
      // Remove from selection
      setSelectedLocations((prev) => prev.filter((id) => id !== locationId));
    } else if (selectedLocations.length < 24) {
      // Add to selection
      setSelectedLocations((prev) => [...prev, locationId]);
    }
  };

  const handleBoardPositionClick = (position: number) => {
    if (position === 12) return; // Center is always FREE

    if (boardLayout[position]) {
      // Remove location from this position
      const newLayout = [...boardLayout];
      newLayout[position] = null;
      setBoardLayout(newLayout);
    } else if (selectedLocations.length > 0) {
      // Place first selected location here
      const newLayout = [...boardLayout];
      newLayout[position] = selectedLocations[0];
      setBoardLayout(newLayout);
      setSelectedLocations((prev) => prev.slice(1));
    }
  };

  // Utility to shuffle arrays (Fisher-Yates)
  function shuffleArray<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Randomize board from either the entire pool or only the selected locations
  const handleRandomizeBoard = (from: "all" | "selected" = "all") => {
    setError("");
    const pool =
      from === "selected" ? [...selectedLocations] : locations.map((l) => l.id);

    if (from === "selected" && selectedLocations.length < 24) {
      setError(
        "Select at least 24 locations to randomize from your selection.",
      );
      return;
    }
    if (pool.length < 24) {
      setError("Not enough locations available to auto-fill the board.");
      return;
    }

    const randomIds = shuffleArray(pool).slice(0, 24);
    const newLayout: (string | null)[] = new Array(25).fill(null);

    // Create randomized positions excluding the center (index 12)
    const positions = shuffleArray(
      [...Array(25).keys()].filter((i) => i !== 12),
    );

    for (let i = 0; i < 24; i++) {
      newLayout[positions[i]] = randomIds[i];
    }

    setBoardLayout(newLayout);
    // Clear any pending selection queue to avoid confusion
    setSelectedLocations([]);
  };

  // Fill only empty positions with random unique locations from either all or selected pool
  const handleFillRemaining = (from: "all" | "selected" = "all") => {
    setError("");

    // Determine empty positions (exclude FREE at index 12)
    const emptyPositions = boardLayout
      .map((loc, i) => ({ loc, i }))
      .filter(({ loc, i }) => i !== 12 && !loc)
      .map(({ i }) => i);

    if (emptyPositions.length === 0) return;

    // Build candidate pool while excluding already placed ids
    const placedIds = new Set(
      boardLayout
        .map((loc, i) => (i !== 12 ? loc : null))
        .filter((x): x is string => Boolean(x)),
    );

    const poolAll = locations.map((l) => l.id);
    const poolSelected = selectedLocations;
    const basePool = from === "selected" ? poolSelected : poolAll;
    const candidates = basePool.filter((id) => !placedIds.has(id));

    if (candidates.length < emptyPositions.length) {
      setError("Not enough locations available to fill remaining spaces.");
      return;
    }

    const chosen = shuffleArray(candidates).slice(0, emptyPositions.length);
    const positionsShuffled = shuffleArray(emptyPositions);

    const newLayout = [...boardLayout];
    for (let i = 0; i < chosen.length; i++) {
      newLayout[positionsShuffled[i]] = chosen[i];
    }
    setBoardLayout(newLayout);
  };

  const handleClearBoard = () => {
    setError("");
    setBoardLayout(new Array(25).fill(null));
    setSelectedLocations([]);
  };

  const handleSaveBoard = async () => {
    if (boardLayout.filter((loc, index) => loc && index !== 12).length !== 24) {
      setError("Please place all 24 locations on your board");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/game/${sessionCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          boardLayout,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save board");
        setIsSaving(false);
        return;
      }

      // Redirect to waiting room
      router.push(`/game/${sessionCode}/lobby`);
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSaving(false);
    }
  };

  const getLocationById = (id: string) => {
    return locations.find((loc) => loc.id === id);
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
        <div className="text-center">
          <p className="body-1 text-tertiary-300">Session not found</p>
          <Button
            variant="outline"
            onClick={() => router.push("/join")}
            className="mt-4"
          >
            Back to Join Game
          </Button>
        </div>
      </div>
    );
  }

  const placedCount = boardLayout.filter(
    (loc, index) => loc && index !== 12,
  ).length;
  const emptyCount = 24 - placedCount;
  const placedIdsForUi = new Set(
    boardLayout
      .map((loc, i) => (i !== 12 ? loc : null))
      .filter((x): x is string => Boolean(x)),
  );
  const availableFromAll = locations.filter(
    (l) => !placedIdsForUi.has(l.id),
  ).length;
  const availableFromSelected = selectedLocations.filter(
    (id) => !placedIdsForUi.has(id),
  ).length;

  const uniqueCategories = Array.from(
    new Set(
      locations.map((l) => l.category).filter((c): c is string => Boolean(c)),
    ),
  );

  const displayLocations = locations
    .filter((l) => (!hidePlaced ? true : !placedIdsForUi.has(l.id)))
    .filter((l) =>
      categoryFilter === "ALL" ? true : l.category === categoryFilter,
    )
    .filter((l) => l.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aSelected = selectedLocations.includes(a.id);
      const bSelected = selectedLocations.includes(b.id);
      if (aSelected !== bSelected) return aSelected ? -1 : 1;

      const aPlaced = boardLayout.includes(a.id);
      const bPlaced = boardLayout.includes(b.id);
      if (aPlaced !== bPlaced) return aPlaced ? 1 : -1;

      if (sortBy === "name-asc") return a.name.localeCompare(b.name);
      if (sortBy === "name-desc") return b.name.localeCompare(a.name);
      const ac = a.category || "";
      const bc = b.category || "";
      if (ac !== bc) return ac.localeCompare(bc);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-20 py-8 sm:py-12 lg:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="heading-1 text-tertiary-500">
            Set Up Your BINGO Board
          </h1>
          <p className="body-1 text-tertiary-300 mt-2">
            Session {session.code} • Select 24 locations for your 5x5 board
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Bingo Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="heading-3 text-tertiary-500">
                  Your BINGO Board
                </CardTitle>
                <CardDescription>
                  Click on empty spaces to place your selected locations, or use
                  the quick actions to auto-fill.
                </CardDescription>

                {/* Quick Actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRandomizeBoard("all")}
                    disabled={isSaving || locations.length < 24}
                  >
                    Randomize Board
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRandomizeBoard("selected")}
                    disabled={isSaving || selectedLocations.length < 24}
                  >
                    Randomize from Selected
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFillRemaining("all")}
                    disabled={
                      isSaving ||
                      emptyCount === 0 ||
                      availableFromAll < emptyCount
                    }
                  >
                    Fill Remaining
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFillRemaining("selected")}
                    disabled={
                      isSaving ||
                      emptyCount === 0 ||
                      availableFromSelected < emptyCount
                    }
                  >
                    Fill Remaining from Selected
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClearBoard}
                    disabled={
                      isSaving ||
                      (placedCount === 0 && selectedLocations.length === 0)
                    }
                  >
                    Clear Board
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-1 sm:gap-2 max-w-md mx-auto">
                  {boardLayout.map((locationId, position) => (
                    <div
                      key={position}
                      className={`
                        aspect-square border-2 rounded-lg flex items-center justify-center p-1 sm:p-2 cursor-pointer transition-all
                        ${
                          position === 12
                            ? "bg-primary-500 text-white border-primary-600"
                            : locationId
                              ? "bg-primary-100 border-primary-300 hover:bg-primary-200"
                              : "bg-neutral-100 border-neutral-300 hover:bg-neutral-200"
                        }
                      `}
                      onClick={() => handleBoardPositionClick(position)}
                    >
                      {position === 12 ? (
                        <div className="text-center">
                          <p className="body-4 sm:body-3 font-bold">FREE</p>
                        </div>
                      ) : locationId ? (
                        <div className="text-center">
                          <p className="body-5 sm:body-4 text-tertiary-600 font-medium">
                            {getLocationById(locationId)?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="body-5 sm:body-4 text-tertiary-400">
                            Empty
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <p className="body-2 text-tertiary-500">
                    Placed: {placedCount}/24
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location Selection */}
          <div className="space-y-6">
            {/* Selected Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  Selected Locations ({selectedLocations.length}/24)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedLocations.length === 0 ? (
                  <p className="body-2 text-tertiary-300 text-center py-4">
                    No locations selected yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedLocations.map((locationId) => {
                      const location = getLocationById(locationId);
                      return (
                        <div
                          key={locationId}
                          className="p-2 bg-primary-100 rounded border border-primary-300"
                        >
                          <p className="body-3 text-tertiary-600 font-medium">
                            {location?.name}
                          </p>
                          {location?.category && (
                            <Badge className="mt-1 bg-accent-sage text-white text-xs">
                              {location.category}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="heading-4 text-tertiary-500">
                  Available Locations
                </CardTitle>
                <CardDescription>
                  Click to select locations for your board
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-[32rem] overflow-y-auto">
                  <div className="sticky top-0 z-10 -mx-4 sm:-mx-6 lg:mx-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-neutral-200 px-4 sm:px-6 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search locations..."
                        className="min-w-[220px] flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                      />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300"
                      >
                        <option value="name-asc">Sort: A → Z</option>
                        <option value="name-desc">Sort: Z → A</option>
                        <option value="category">Sort: Category</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm text-tertiary-500">
                        <input
                          type="checkbox"
                          checked={hidePlaced}
                          onChange={(e) => setHidePlaced(e.target.checked)}
                          className="h-4 w-4 rounded border-neutral-300"
                        />
                        Hide placed
                      </label>
                    </div>
                    <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => setCategoryFilter("ALL")}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          categoryFilter === "ALL"
                            ? "bg-primary-600 text-white border-primary-700"
                            : "bg-white text-tertiary-600 border-neutral-300 hover:bg-neutral-50"
                        }`}
                      >
                        All
                      </button>
                      {uniqueCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition ${
                            categoryFilter === cat
                              ? "bg-primary-600 text-white border-primary-700"
                              : "bg-white text-tertiary-600 border-neutral-300 hover:bg-neutral-50"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 p-2">
                    {displayLocations.map((location) => {
                      const isSelected = selectedLocations.includes(
                        location.id,
                      );
                      const isPlaced = boardLayout.includes(location.id);

                      return (
                        <div
                          key={location.id}
                          className={`
                            group flex items-center justify-between gap-3 rounded-md border cursor-pointer transition-colors p-2.5
                            ${
                              isPlaced
                                ? "bg-success/10 border-success/30 cursor-not-allowed"
                                : isSelected
                                  ? "bg-primary-100 border-primary-300"
                                  : "bg-white border-neutral-300 hover:bg-neutral-50"
                            }
                          `}
                          onClick={() =>
                            !isPlaced && handleLocationSelect(location.id)
                          }
                        >
                          <div className="min-w-0">
                            <p className="truncate body-3 text-tertiary-700 font-medium">
                              {location.name}
                            </p>
                            {location.category && (
                              <Badge className="mt-1 bg-accent-sage text-white text-[10px] leading-4 px-2 py-0.5">
                                {location.category}
                              </Badge>
                            )}
                          </div>
                          {isPlaced && (
                            <Badge className="bg-success text-white text-[10px] leading-4 px-2 py-0.5 shrink-0">
                              Placed
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}

              <Button
                variant="primary"
                onClick={handleSaveBoard}
                disabled={isSaving || placedCount !== 24}
                className="w-full h-12"
              >
                {isSaving ? "Saving..." : "Save Board & Join Game"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardSetupPage;
