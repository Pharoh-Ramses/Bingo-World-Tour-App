"use client";

import { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/useWebSocket";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

interface AdminEventDashboardProps {
  sessionCode: string;
}

interface EventAnalytics {
  totalPlayers: number;
  activePlayers: number;
  tilesMarkedPerMinute: number;
  averageTimeToMark: number;
  peakActivityTime: Date;
  engagementScore: number;
  startTime: Date;
  lastActivityTime: Date;
  currentRevealIndex: number;
  totalReveals: number;
  winnersCount: number;
  averageBoardCompletion: number;
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

interface EventPacingConfig {
  dramaticReveal: boolean;
  countdownDuration: number;
  currentPace: 'normal' | 'fast' | 'slow' | 'dramatic';
  customInterval?: number;
}

export default function AdminEventDashboard({ sessionCode }: AdminEventDashboardProps) {
  const { isConnected, lastMessage, send } = useWebSocket(sessionCode, 'admin');
  
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [displayConfig, setDisplayConfig] = useState<AudienceDisplayConfig>({
    showCurrentLocation: true,
    showRevealCount: true,
    showPlayerCount: true,
    showTimer: true
  });
  
  const [pacingConfig, setPacingConfig] = useState<EventPacingConfig>({
    dramaticReveal: false,
    countdownDuration: 5,
    currentPace: 'normal'
  });

  const [hostMessage, setHostMessage] = useState('');
  const [messagePriority, setMessagePriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    dataTypes: ['players', 'winners', 'engagement']
  });

  // Handle WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "analytics-data":
        setAnalytics(lastMessage.data);
        break;

      case "audience-display-updated":
        setDisplayConfig(lastMessage.data);
        break;

      case "event-pace-updated":
        setPacingConfig(prev => ({
          ...prev,
          currentPace: lastMessage.data.pace,
          customInterval: lastMessage.data.newInterval
        }));
        break;

      case "export-ready":
        alert(`Export ready! Download: ${lastMessage.data.downloadUrl}`);
        break;

      case "export-error":
        alert(`Export failed: ${lastMessage.data.error}`);
        break;
    }
  }, [lastMessage]);

  // Request analytics data periodically
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        send({ type: "analytics-request" });
      }, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, send]);

  const handlePresentationModeToggle = (enabled: boolean) => {
    send({ type: "presentation-mode-toggle", enabled });
  };

  const handleAudienceDisplayUpdate = (config: Partial<AudienceDisplayConfig>) => {
    const newConfig = { ...displayConfig, ...config };
    setDisplayConfig(newConfig);
    send({ type: "audience-display-config", config: newConfig });
  };

  const handlePaceControl = (pace: string, newInterval?: number) => {
    setPacingConfig(prev => ({ ...prev, currentPace: pace as any, customInterval: newInterval }));
    send({ type: "event-pace-control", pace, newInterval });
  };

  const handleHostAnnouncement = () => {
    if (!hostMessage.trim()) return;
    send({ type: "host-announcement", message: hostMessage, priority: messagePriority });
    setHostMessage('');
  };

  const handleManualReveal = () => {
    send({ type: "manual-reveal" });
  };

  const handleConfettiTrigger = () => {
    send({ 
      type: "confetti-trigger", 
      options: { 
        intensity: "high", 
        duration: 5000,
        colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"]
      } 
    });
  };

  const handleExport = () => {
    send({ type: "export-data-request", exportOptions });
  };

  const renderAnalyticsDashboard = () => {
    if (!analytics) return null;

    const engagementColor = analytics.engagementScore > 70 ? 'success' : analytics.engagementScore > 40 ? 'warning' : 'error';
    const progressPercentage = (analytics.currentRevealIndex / analytics.totalReveals) * 100;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="body-2">Total:</span>
                <span className="heading-4">{analytics.totalPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="body-2">Active:</span>
                <span className="heading-4 text-success-500">{analytics.activePlayers}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Game Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="body-2">Revealed:</span>
                <span className="heading-4">{analytics.currentRevealIndex}/{analytics.totalReveals}</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="body-3 text-neutral-600">{progressPercentage.toFixed(1)}% Complete</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="body-2">Score:</span>
                <Badge variant={engagementColor as any}>
                  {analytics.engagementScore.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="body-2">Tiles/min:</span>
                <span className="heading-4">{analytics.tilesMarkedPerMinute}</span>
              </div>
              <div className="flex justify-between">
                <span className="body-2">Avg Time:</span>
                <span className="heading-4">{(analytics.averageTimeToMark / 1000).toFixed(1)}s</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Winners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="body-2">Total:</span>
                <span className="heading-4">{analytics.winnersCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="body-2">Avg Completion:</span>
                <span className="heading-4">{analytics.averageBoardCompletion.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEventControls = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Game Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleManualReveal}>
              Reveal Location
            </Button>
            <Button variant="secondary" onClick={handleConfettiTrigger}>
              Trigger Confetti
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="body-2 font-medium">Event Pace</label>
            <div className="flex gap-2">
              <Button 
                variant={pacingConfig.currentPace === 'normal' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePaceControl('normal')}
              >
                Normal
              </Button>
              <Button 
                variant={pacingConfig.currentPace === 'fast' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePaceControl('fast')}
              >
                Fast
              </Button>
              <Button 
                variant={pacingConfig.currentPace === 'slow' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePaceControl('slow')}
              >
                Slow
              </Button>
              <Button 
                variant={pacingConfig.currentPace === 'dramatic' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handlePaceControl('dramatic')}
              >
                Dramatic
              </Button>
            </div>
          </div>

          <div>
            <label className="body-2 font-medium">Custom Interval (minutes)</label>
            <Input
              type="number"
              value={pacingConfig.customInterval || ''}
              onChange={(e) => handlePaceControl(pacingConfig.currentPace, parseInt(e.target.value) || undefined)}
              placeholder="Leave empty for default"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Presentation Mode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="body-2 font-medium">Enable Audience Display</span>
            <Button 
              variant="primary" 
              onClick={() => handlePresentationModeToggle(true)}
            >
              Enable
            </Button>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayConfig.showCurrentLocation}
                onChange={(e) => handleAudienceDisplayUpdate({ showCurrentLocation: e.target.checked })}
                className="rounded"
              />
              <span className="body-2">Show Current Location</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayConfig.showRevealCount}
                onChange={(e) => handleAudienceDisplayUpdate({ showRevealCount: e.target.checked })}
                className="rounded"
              />
              <span className="body-2">Show Reveal Count</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayConfig.showPlayerCount}
                onChange={(e) => handleAudienceDisplayUpdate({ showPlayerCount: e.target.checked })}
                className="rounded"
              />
              <span className="body-2">Show Player Count</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={displayConfig.showTimer}
                onChange={(e) => handleAudienceDisplayUpdate({ showTimer: e.target.checked })}
                className="rounded"
              />
              <span className="body-2">Show Timer</span>
            </label>
          </div>

          <div>
            <label className="body-2 font-medium">Event Name</label>
            <Input
              value={displayConfig.customBranding?.eventName || ''}
              onChange={(e) => handleAudienceDisplayUpdate({ 
                customBranding: { ...displayConfig.customBranding, eventName: e.target.value }
              })}
              placeholder="Bingo World Tour"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCommunicationTools = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Host Communication</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={hostMessage}
            onChange={(e) => setHostMessage(e.target.value)}
            placeholder="Type announcement to audience..."
            className="flex-1"
          />
          <select
            value={messagePriority}
            onChange={(e) => setMessagePriority(e.target.value as any)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <Button variant="primary" onClick={handleHostAnnouncement}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderExportTools = () => (
    <Card>
      <CardHeader>
        <CardTitle>Export & CRM</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="body-2 font-medium">Export Format</label>
          <select
            value={exportOptions.format}
            onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
            className="w-full mt-1 px-3 py-2 border rounded-md"
          >
            <option value="csv">CSV</option>
            <option value="xlsx">Excel</option>
            <option value="json">JSON</option>
          </select>
        </div>

        <div>
          <label className="body-2 font-medium">Data Types</label>
          <div className="space-y-2 mt-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.dataTypes.includes('players')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExportOptions(prev => ({ ...prev, dataTypes: [...prev.dataTypes, 'players'] }));
                  } else {
                    setExportOptions(prev => ({ ...prev, dataTypes: prev.dataTypes.filter(t => t !== 'players') }));
                  }
                }}
                className="rounded"
              />
              <span className="body-2">Player Data</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.dataTypes.includes('winners')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExportOptions(prev => ({ ...prev, dataTypes: [...prev.dataTypes, 'winners'] }));
                  } else {
                    setExportOptions(prev => ({ ...prev, dataTypes: prev.dataTypes.filter(t => t !== 'winners') }));
                  }
                }}
                className="rounded"
              />
              <span className="body-2">Winner Information</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={exportOptions.dataTypes.includes('engagement')}
                onChange={(e) => {
                  if (e.target.checked) {
                    setExportOptions(prev => ({ ...prev, dataTypes: [...prev.dataTypes, 'engagement'] }));
                  } else {
                    setExportOptions(prev => ({ ...prev, dataTypes: prev.dataTypes.filter(t => t !== 'engagement') }));
                  }
                }}
                className="rounded"
              />
              <span className="body-2">Engagement Analytics</span>
            </label>
          </div>
        </div>

        <Button variant="primary" onClick={handleExport} className="w-full">
          Generate Export
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <header className="mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="heading-1 text-primary-500">Event Dashboard</h1>
            <p className="body-1 text-neutral-600">Session: {sessionCode}</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isConnected ? 'success' : 'error'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            <Button variant="outline" onClick={() => window.open(`/game/${sessionCode}/audience`, '_blank')}>
              Open Audience Display
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {renderAnalyticsDashboard()}
        {renderEventControls()}
        {renderCommunicationTools()}
        {renderExportTools()}
      </main>
    </div>
  );
}