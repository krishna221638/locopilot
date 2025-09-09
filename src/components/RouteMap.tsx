import React from 'react';
import { cn } from '@/lib/utils';
import type { Station, TrackSignal } from './LocomotiveDashboard';

interface RouteMapProps {
  stations: Station[];
  trainProgress: number;
  currentTrack: number;
  trackSignals: TrackSignal[];
  currentStationIndex: number;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  stations,
  trainProgress,
  currentTrack,
  trackSignals,
  currentStationIndex,
}) => {
  return (
    <div className="w-full h-full bg-dashboard-panel rounded-xl p-6 border border-border">
      <div className="relative w-full h-full">
        {/* Track Container */}
        <div className="absolute inset-0 flex flex-col justify-around">
          {/* Track 1 */}
          <div className="relative h-2 bg-rail-track rounded-full mx-8">
            <div className="absolute inset-0 bg-rail-metal h-0.5 top-1/2 -translate-y-1/2 rounded-full" />
          </div>
          
          {/* Track 2 */}
          <div className="relative h-2 bg-rail-track rounded-full mx-8">
            <div className="absolute inset-0 bg-rail-metal h-0.5 top-1/2 -translate-y-1/2 rounded-full" />
          </div>
        </div>

        {/* Train Position */}
        <div
          className={cn(
            "absolute w-4 h-6 bg-signal-green rounded-sm transition-all duration-500",
            "shadow-[0_0_10px] shadow-signal-green/70 animate-train-move",
            currentTrack === 1 ? "top-[25%]" : "top-[75%]"
          )}
          style={{ left: `${Math.max(2, Math.min(94, trainProgress))}%` }}
        />

        {/* Track Signals */}
        {trackSignals.map((signal) => (
          <div
            key={signal.id}
            className={cn(
              "absolute w-3 h-3 rounded-full transition-all duration-300",
              signal.track === 1 ? "top-[25%]" : "top-[75%]",
              signal.state === 'red' && "bg-signal-red shadow-[0_0_8px] shadow-signal-red/70",
              signal.state === 'yellow' && "bg-signal-yellow shadow-[0_0_8px] shadow-signal-yellow/70",
              signal.state === 'green' && "bg-signal-green shadow-[0_0_8px] shadow-signal-green/70",
              Math.abs(signal.position - trainProgress) < 10 ? "opacity-100 animate-signal-pulse" : "opacity-40"
            )}
            style={{ left: `${signal.position}%` }}
          />
        ))}

        {/* Station Markers */}
        {stations.map((station, index) => (
          <div
            key={station.name}
            className="absolute top-0 bottom-0 flex flex-col justify-center"
            style={{ left: `${station.position}%` }}
          >
            <div className="w-0.5 h-full bg-muted-foreground/40" />
            <div 
              className={cn(
                "absolute -bottom-8 text-xs font-medium whitespace-nowrap transform -translate-x-1/2",
                index === currentStationIndex ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              {station.name}
            </div>
          </div>
        ))}
      </div>

      {/* Station Info */}
      <div className="mt-8 flex justify-between text-sm">
        <span className="text-muted-foreground">
          Previous: {stations[currentStationIndex > 0 ? currentStationIndex - 1 : stations.length - 1]?.name}
        </span>
        <span className="text-primary font-bold">
          Current: {stations[currentStationIndex]?.name}
        </span>
        <span className="text-muted-foreground">
          Next: {stations[(currentStationIndex + 1) % stations.length]?.name}
        </span>
      </div>
    </div>
  );
};