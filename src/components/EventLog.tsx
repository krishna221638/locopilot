import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Volume2, AlertTriangle, Info, RadioIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventLogEntry } from "./LocomotiveDashboard";

interface EventLogProps {
  events: EventLogEntry[];
  onPlayAudio: (audioUrl: string) => void;
  isAudioPlaying?: boolean;
}

export const EventLog: React.FC<EventLogProps> = ({
  events,
  onPlayAudio,
  isAudioPlaying = false,
}) => {
  const getEventIcon = (type: EventLogEntry["type"]) => {
    switch (type) {
      case "signal":
        return <Zap className="w-4 h-4" />;
      case "controller":
        return <RadioIcon className="w-4 h-4" />;
      case "weather":
        return <Info className="w-4 h-4" />;
      case "station":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: EventLogEntry["priority"]) => {
    switch (priority) {
      case "critical":
        return "border-l-signal-red text-signal-red";
      case "high":
        return "border-l-signal-yellow text-signal-yellow";
      case "medium":
        return "border-l-primary text-primary";
      case "low":
        return "border-l-muted-foreground text-muted-foreground";
      default:
        return "border-l-muted-foreground text-muted-foreground";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleEventClick = (event: EventLogEntry) => {
    if (event.audioUrl) {
      onPlayAudio(event.audioUrl);
    } else {
      // Generate a simple beep sound for events without audio
      try {
        const AudioContextClass =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const context = new AudioContextClass();
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(context.destination);

          oscillator.frequency.setValueAtTime(800, context.currentTime);
          gainNode.gain.setValueAtTime(0.3, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            context.currentTime + 0.5
          );

          oscillator.start(context.currentTime);
          oscillator.stop(context.currentTime + 0.5);
        }
      } catch (error) {
        console.log("Audio not supported");
      }
    }
  };

  return (
    <Card className="h-full bg-dashboard-event border-border w-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <RadioIcon className="w-5 h-5 text-primary" />
          Live Event Log
          {isAudioPlaying && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAudioPlaying
            ? "Audio playing - click event to stop"
            : "Click events to play audio"}
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)] w-full">
        <div className="p-3 space-y-2 w-full">
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No events yet</p>
            </div>
          ) : (
            events.map((event) => (
              <Button
                key={event.id}
                variant="ghost"
                className={cn(
                  "w-full p-3 h-auto text-left border-l-4 hover:bg-muted/50 transition-all",
                  "cursor-pointer active:scale-[0.98] text-xs block",
                  getPriorityColor(event.priority)
                )}
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5 flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                        {event.type}
                        {event.audioUrl && (
                          <div className="w-1.5 h-1.5 bg-signal-green rounded-full animate-pulse"></div>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-foreground event-message break-words leading-relaxed whitespace-normal">
                      {event.message}
                    </p>
                    {event.priority === "critical" && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3 h-3 text-signal-red" />
                        <span className="text-xs font-medium text-signal-red">
                          CRITICAL
                        </span>
                      </div>
                    )}
                    {event.audioUrl && (
                      <div className="mt-1.5 text-xs text-signal-green font-medium flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {isAudioPlaying
                          ? "Click to stop audio"
                          : "Audio available"}
                      </div>
                    )}
                  </div>
                </div>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
