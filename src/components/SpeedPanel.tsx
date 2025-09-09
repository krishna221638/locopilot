import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SignalType, WeatherType } from './LocomotiveDashboard';

interface SpeedPanelProps {
  currentSignal: SignalType;
  currentWeather: WeatherType;
}

export const SpeedPanel: React.FC<SpeedPanelProps> = ({ currentSignal, currentWeather }) => {
  const calculateRecommendedSpeed = (): { speed: number; color: string } => {
    let baseSpeed = 0;
    let color = '';

    // Base speed from signal
    switch (currentSignal) {
      case 'red':
        baseSpeed = 0;
        color = 'text-signal-red';
        break;
      case 'yellow':
        baseSpeed = 70;
        color = 'text-signal-yellow';
        break;
      case 'green':
        baseSpeed = 130;
        color = 'text-signal-green';
        break;
    }

    // Weather adjustments
    if (currentWeather === 'fog' || currentWeather === 'storm') {
      baseSpeed = Math.floor(baseSpeed * 0.6);
      color = 'text-signal-yellow';
    } else if (currentWeather === 'rain') {
      baseSpeed = Math.floor(baseSpeed * 0.8);
    }

    return { speed: baseSpeed, color };
  };

  const { speed, color } = calculateRecommendedSpeed();

  return (
    <Card className="p-4 text-center border border-border bg-dashboard-panel">
      <h3 className="text-xs uppercase font-medium text-muted-foreground mb-2 tracking-wide">
        Recommended Speed
      </h3>
      
      <div className="flex items-baseline justify-center gap-2">
        <span className={cn("text-5xl font-bold transition-colors duration-500", color)}>
          {speed}
        </span>
        <span className="text-lg text-muted-foreground">km/h</span>
      </div>
      
      <div className="mt-2 text-xs text-muted-foreground">
        Based on signal & weather
      </div>
    </Card>
  );
};