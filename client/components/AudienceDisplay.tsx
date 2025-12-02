"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AudienceDisplayProps {
  sessionCode: string;
  isPresentationMode?: boolean;
}

interface AudienceDisplayConfig {
  showCurrentLocation: boolean;
  showRevealCount: boolean;
  showPlayerCount: boolean;
  showTimer: boolean;
  customBranding?: {
    logo: string;
    eventName: string;
    sponsorLogo?: string;
  };
}

interface WinnerCelebration {
  place: number;
  winner: {
    userId: string;
    userName: string;
    winPattern: string;
    winningTime: string;
    boardCompletion: number;
    playerPhoto?: string;
    company?: string;
  };
  celebrationDuration: number;
}

interface VisualEffect {
  effect: string;
  target: string;
  duration: number;
  intensity?: string;
  colors?: string[];
}

export default function AudienceDisplay({ sessionCode, isPresentationMode = true }: AudienceDisplayProps) {
  const { isConnected, lastMessage, send } = useWebSocket(sessionCode, 'audience');
  
  const [displayConfig, setDisplayConfig] = useState<AudienceDisplayConfig>({
    showCurrentLocation: true,
    showRevealCount: true,
    showPlayerCount: true,
    showTimer: true
  });
  
  const [gameState, setGameState] = useState({
    status: 'WAITING',
    currentLocation: null,
    revealedLocations: [],
    playerCount: 0,
    currentRevealIndex: 0,
    maxReveals: 50,
    winners: []
  });

  const [winnerCelebration, setWinnerCelebration] = useState<WinnerCelebration | null>(null);
  const [visualEffect, setVisualEffect] = useState<VisualEffect | null>(null);
  const [hostMessage, setHostMessage] = useState<{ message: string; priority: string } | null>(null);
  const [timeToNextReveal, setTimeToNextReveal] = useState<number>(0);

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "connected":
        setGameState(prev => ({
          ...prev,
          status: lastMessage.data.status,
          revealedLocations: lastMessage.data.revealedLocations || [],
          currentRevealIndex: lastMessage.data.revealedLocations?.length || 0
        }));
        break;

      case "location-revealed":
        setGameState(prev => ({
          ...prev,
          currentLocation: lastMessage.data,
          revealedLocations: [...prev.revealedLocations, lastMessage.data],
          currentRevealIndex: prev.currentRevealIndex + 1
        }));
        break;

      case "audience-display-updated":
        setDisplayConfig(lastMessage.data);
        break;

      case "winner-celebration-start":
        setWinnerCelebration(lastMessage.data);
        setTimeout(() => setWinnerCelebration(null), lastMessage.data.celebrationDuration);
        break;

      case "visual-effect":
        setVisualEffect(lastMessage.data);
        setTimeout(() => setVisualEffect(null), lastMessage.data.duration);
        break;

      case "host-announcement":
        setHostMessage(lastMessage.data);
        setTimeout(() => setHostMessage(null), lastMessage.data.displayDuration);
        break;

      case "game-started":
        setGameState(prev => ({ ...prev, status: 'ACTIVE' }));
        break;

      case "game-ended":
        setGameState(prev => ({ ...prev, status: 'ENDED' }));
        break;

      case "player-joined":
        setGameState(prev => ({ ...prev, playerCount: prev.playerCount + 1 }));
        break;

      case "player-left":
        setGameState(prev => ({ ...prev, playerCount: Math.max(0, prev.playerCount - 1) }));
        break;
    }
  }, [lastMessage]);

  // Countdown timer effect
  useEffect(() => {
    if (gameState.status === 'ACTIVE' && timeToNextReveal > 0) {
      const timer = setInterval(() => {
        setTimeToNextReveal(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeToNextReveal, gameState.status]);

  const renderConfetti = () => {
    if (!visualEffect || visualEffect.effect !== 'confetti') return null;

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: visualEffect.colors?.[i % (visualEffect.colors?.length || 1)] || '#FFD700'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWinnerCelebration = () => {
    if (!winnerCelebration) return null;

    const { place, winner } = winnerCelebration;
    const placeColors = {
      1: 'bg-yellow-500',
      2: 'bg-gray-400', 
      3: 'bg-orange-600'
    };

    const placeLabels = {
      1: '1st Place',
      2: '2nd Place',
      3: '3rd Place'
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-40">
        <Card className="max-w-2xl mx-4 p-8 text-center">
          <div className={`inline-block px-6 py-3 rounded-full text-white font-bold text-2xl mb-6 ${placeColors[place as keyof typeof placeColors]}`}>
            {placeLabels[place as keyof typeof placeLabels]}
          </div>
          
          {winner.playerPhoto && (
            <img
              src={winner.playerPhoto}
              alt={winner.userName}
              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
          )}
          
          <h1 className="heading-1 text-neutral-1000 mb-2">{winner.userName}</h1>
          {winner.company && (
            <p className="body-2 text-neutral-600 mb-4">{winner.company}</p>
          )}
          
          <div className="space-y-2 mb-6">
            <p className="body-1"><strong>Winning Pattern:</strong> {winner.winPattern}</p>
            <p className="body-1"><strong>Board Completion:</strong> {winner.boardCompletion}%</p>
            <p className="body-1"><strong>Time:</strong> {new Date(winner.winningTime).toLocaleTimeString()}</p>
          </div>
          
          <div className="animate-pulse">
            <Badge variant="primary" size="lg">🎉 Congratulations! 🎉</Badge>
          </div>
        </Card>
      </div>
    );
  };

  const renderHostMessage = () => {
    if (!hostMessage) return null;

    const priorityColors = {
      low: 'bg-blue-100 border-blue-500 text-blue-800',
      medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      high: 'bg-red-100 border-red-500 text-red-800'
    };

    return (
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className={`border-4 rounded-lg p-4 shadow-lg ${priorityColors[hostMessage.priority as keyof typeof priorityColors]}`}>
          <p className="heading-4 font-bold">{hostMessage.message}</p>
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="bg-primary-900 text-white p-6 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {displayConfig.customBranding?.logo && (
            <img
              src={displayConfig.customBranding.logo}
              alt="Event Logo"
              className="h-16 w-auto"
            />
          )}
          <div>
            <h1 className="heading-2">{displayConfig.customBranding?.eventName || 'Bingo World Tour'}</h1>
            <p className="body-2 text-primary-200">Session Code: {sessionCode}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          {displayConfig.showPlayerCount && (
            <div className="text-center">
              <p className="body-2 text-primary-200">Players</p>
              <p className="heading-3">{gameState.playerCount}</p>
            </div>
          )}
          
          {displayConfig.showRevealCount && (
            <div className="text-center">
              <p className="body-2 text-primary-200">Revealed</p>
              <p className="heading-3">{gameState.currentRevealIndex}/{gameState.maxReveals}</p>
            </div>
          )}
          
          {displayConfig.showTimer && gameState.status === 'ACTIVE' && (
            <div className="text-center">
              <p className="body-2 text-primary-200">Next Reveal</p>
              <p className="heading-3">{Math.floor(timeToNextReveal / 60)}:{(timeToNextReveal % 60).toString().padStart(2, '0')}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  const renderMainContent = () => {
    if (winnerCelebration) return null; // Winner celebration takes full screen
    if (gameState.status === 'WAITING') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-2xl mx-4 p-8 text-center">
            <h1 className="heading-1 text-primary-500 mb-4">Welcome to Bingo World Tour!</h1>
            <p className="body-1 text-neutral-600 mb-6">Get ready for an exciting travel adventure.</p>
            <div className="space-y-4">
              <p className="body-2">Session Code: <span className="font-mono font-bold text-lg">{sessionCode}</span></p>
              <Badge variant="secondary" size="lg">Game Starting Soon</Badge>
            </div>
          </Card>
        </div>
      );
    }

    if (gameState.status === 'ENDED') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-2xl mx-4 p-8 text-center">
            <h1 className="heading-1 text-primary-500 mb-4">Game Complete!</h1>
            <p className="body-1 text-neutral-600 mb-6">Thank you for playing Bingo World Tour!</p>
            {gameState.winners.length > 0 && (
              <div className="space-y-4">
                <h2 className="heading-3">Winners</h2>
                {gameState.winners.map((winner: { place: number; userName: string }, index: number) => (
                  <div key={index} className="flex items-center justify-center space-x-4">
                    <Badge variant={winner.place === 1 ? 'primary' : winner.place === 2 ? 'secondary' : 'accent'}>
                      {winner.place === 1 ? '🥇' : winner.place === 2 ? '🥈' : '🥉'} {winner.userName}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        {displayConfig.showCurrentLocation && gameState.currentLocation ? (
          <Card className="max-w-4xl w-full p-8">
            <div className="text-center">
              <h2 className="heading-2 text-primary-500 mb-6">Location Revealed!</h2>
              <div className="mb-6">
                {gameState.currentLocation.imageUrl && (
                  <img
                    src={gameState.currentLocation.imageUrl}
                    alt={gameState.currentLocation.name}
                    className="w-64 h-64 object-cover rounded-lg mx-auto mb-4 shadow-lg"
                  />
                )}
                <h3 className="heading-1 text-neutral-1000 mb-2">{gameState.currentLocation.name}</h3>
                {gameState.currentLocation.description && (
                  <p className="body-1 text-neutral-600 max-w-2xl mx-auto">
                    {gameState.currentLocation.description}
                  </p>
                )}
                {gameState.currentLocation.category && (
                  <Badge variant="secondary" className="mt-4">
                    {gameState.currentLocation.category}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-4 p-8 text-center">
            <h1 className="heading-2 text-primary-500 mb-4">Get Ready!</h1>
            <p className="body-1 text-neutral-600">Waiting for the next location to be revealed...</p>
          </Card>
        )}
      </div>
    );
  };

  if (!isPresentationMode) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="heading-2 text-primary-500 mb-4">Audience Display</h1>
          <p className="body-1 text-neutral-600 mb-6">Presentation mode is currently disabled.</p>
          <Button variant="primary" onClick={() => send({ type: "presentation-mode-toggle", enabled: true })}>
            Enable Presentation Mode
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {renderHeader()}
      {renderMainContent()}
      {renderWinnerCelebration()}
      {renderConfetti()}
      {renderHostMessage()}
    </div>
  );
}