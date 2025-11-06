"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

interface Location {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    category: string | null;
}

interface BingoBoardProps {
    boardLayout: (string | null)[];
    revealedLocations: string[];
    selectedTiles: boolean[];
    onTileClick: (position: number) => void;
    locations: Location[];
    isGameActive: boolean;
    winningPattern?: string | null;
}

const BingoBoard = ({
    boardLayout,
    revealedLocations,
    selectedTiles,
    onTileClick,
    locations,
    isGameActive,
    winningPattern,
}: BingoBoardProps) => {
    const [winningPositions, setWinningPositions] = useState<number[]>([]);

    useEffect(() => {
        if (winningPattern) {
            // Calculate winning positions based on pattern
            const positions = getWinningPositions(winningPattern);
            setWinningPositions(positions);
        } else {
            setWinningPositions([]);
        }
    }, [winningPattern]);

    const getWinningPositions = (pattern: string): number[] => {
        switch (pattern) {
            case "row-0":
                return [0, 1, 2, 3, 4];
            case "row-1":
                return [5, 6, 7, 8, 9];
            case "row-2":
                return [10, 11, 12, 13, 14];
            case "row-3":
                return [15, 16, 17, 18, 19];
            case "row-4":
                return [20, 21, 22, 23, 24];
            case "col-0":
                return [0, 5, 10, 15, 20];
            case "col-1":
                return [1, 6, 11, 16, 21];
            case "col-2":
                return [2, 7, 12, 17, 22];
            case "col-3":
                return [3, 8, 13, 18, 23];
            case "col-4":
                return [4, 9, 14, 19, 24];
            case "diagonal-1":
                return [0, 6, 12, 18, 24];
            case "diagonal-2":
                return [4, 8, 12, 16, 20];
            default:
                return [];
        }
    };

    const getLocationById = (id: string) => {
        return locations.find((loc) => loc.id === id);
    };

    const getTileState = (position: number) => {
        const locationId = boardLayout[position];
        const isRevealed =
            position === 12 ||
            (locationId && revealedLocations.includes(locationId));
        const isSelected = selectedTiles[position];
        const isWinning = winningPositions.includes(position);

        return {
            isRevealed,
            isSelected,
            isWinning,
            isCenter: position === 12,
            location: locationId ? getLocationById(locationId) : null,
        };
    };

    const getTileClasses = (position: number) => {
        const state = getTileState(position);
        const baseClasses =
            "aspect-square rounded-2xl flex items-center justify-center p-2 sm:p-3 transition-all duration-300 backdrop-blur-xl border";

        if (state.isWinning) {
            return `${baseClasses} bg-success/80 border-success shadow-2xl animate-pulse`;
        }

        if (state.isCenter) {
            return `${baseClasses} bg-primary-500/90 border-primary-400 shadow-xl`;
        }

        if (state.isRevealed && state.isSelected) {
            return `${baseClasses} bg-primary-400/80 border-primary-500 shadow-lg`;
        }

        if (state.isRevealed) {
            return `${baseClasses} bg-white/90 border-primary-300/60 hover:bg-white hover:border-primary-400 cursor-pointer shadow-md hover:shadow-lg`;
        }

        return `${baseClasses} bg-neutral-100/60 border-neutral-300/50 shadow-sm`;
    };

    // Guard against undefined boardLayout
    if (
        !boardLayout ||
        !Array.isArray(boardLayout) ||
        boardLayout.length !== 25
    ) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="text-center p-8 bg-neutral-100 rounded-lg">
                    <p className="body-2 text-tertiary-400">Loading board...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mx-auto">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {boardLayout.map((locationId, position) => {
                    const state = getTileState(position);

                    return (
                        <div
                            key={position}
                            data-testid={`bingo-tile-${position}`}
                            className={getTileClasses(position)}
                            onClick={() => {
                                if (
                                    isGameActive &&
                                    state.isRevealed &&
                                    !state.isCenter
                                ) {
                                    onTileClick(position);
                                }
                            }}
                        >
                            {state.isCenter ? (
                                <div className="text-center">
                                    <p
                                        className="body-4 sm:body-3 font-bold"
                                        style={{ color: "#FFFFFF" }}
                                    >
                                        FREE
                                    </p>
                                </div>
                            ) : state.isRevealed ? (
                                <div className="text-center w-full">
                                    {state.location?.imageUrl ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={state.location.imageUrl}
                                                alt={state.location.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center">
                                                <p className="body-5 sm:body-4 text-white font-medium text-center px-1">
                                                    {state.location.name}
                                                </p>
                                            </div>
                                            {state.isSelected && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-4 h-4 bg-success rounded-full flex items-center justify-center">
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                        >
                                                            <polyline points="20,6 9,17 4,12"></polyline>
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center px-2 relative group">
                                            <div
                                                style={{
                                                    width: "100%",
                                                    overflow: "hidden",
                                                    textAlign: "center",
                                                }}
                                            >
                                                <p
                                                    className="text-xs sm:text-sm font-semibold leading-tight"
                                                    style={{
                                                        color: "#4A4A4A",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    {state.location?.name}
                                                </p>
                                            </div>
                                            {/* Checkmark Badge */}
                                            {state.isSelected && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-lg border border-success/20">
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            className="text-success"
                                                        >
                                                            <polyline points="20,6 9,17 4,12"></polyline>
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}
                                            {/* Tooltip */}
                                            {state.location?.name &&
                                                state.location.name.length >
                                                    12 && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-tertiary-600 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                        {state.location.name}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-tertiary-600"></div>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center w-full">
                                    <div className="w-full h-full flex flex-col items-center justify-center px-1 relative group overflow-hidden">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-tertiary-300 rounded-full flex items-center justify-center mb-1">
                                            <svg
                                                width="12"
                                                height="12"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                className="text-white"
                                            >
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                <circle cx="12" cy="10" r="3" />
                                            </svg>
                                        </div>
                                        <div
                                            style={{
                                                width: "100%",
                                                overflow: "hidden",
                                                textAlign: "center",
                                            }}
                                        >
                                            <p
                                                className="text-xs sm:text-sm font-semibold leading-tight"
                                                style={{
                                                    color: "#4A4A4A",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {state.location?.name ||
                                                    "Hidden"}
                                            </p>
                                        </div>
                                        {/* Tooltip */}
                                        {state.location?.name &&
                                            state.location.name.length > 12 && (
                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-tertiary-600 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                                    {state.location.name}
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-tertiary-600"></div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {winningPattern && (
                <div className="mt-4 text-center">
                    <Badge className="bg-success text-white text-lg px-4 py-2">
                        🎉 BINGO! 🎉
                    </Badge>
                </div>
            )}
        </div>
    );
};

export default BingoBoard;
