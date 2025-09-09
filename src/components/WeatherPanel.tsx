import React from 'react';
import { Card } from '@/components/ui/card';
import { Cloud, CloudRain, CloudSnow, Zap } from 'lucide-react';
import type { WeatherType } from './LocomotiveDashboard';

interface WeatherPanelProps {
  currentWeather: WeatherType;
}

export const WeatherPanel: React.FC<WeatherPanelProps> = ({ currentWeather }) => {
  const weatherConfig = {
    clear: {
      icon: Cloud,
      text: 'Clear',
      temp: '25°C',
      visibility: '10 km',
      bgClass: 'bg-blue-500/10',
      iconClass: 'text-blue-400',
    },
    rain: {
      icon: CloudRain,
      text: 'Rain',
      temp: '22°C',
      visibility: '2 km',
      bgClass: 'bg-blue-600/10',
      iconClass: 'text-blue-500',
    },
    fog: {
      icon: CloudSnow,
      text: 'Foggy',
      temp: '15°C',
      visibility: '0.5 km',
      bgClass: 'bg-gray-500/10',
      iconClass: 'text-gray-400',
    },
    storm: {
      icon: Zap,
      text: 'Storm',
      temp: '20°C',
      visibility: '1 km',
      bgClass: 'bg-signal-yellow/10',
      iconClass: 'text-signal-yellow',
    },
  };

  const config = weatherConfig[currentWeather];
  const WeatherIcon = config.icon;

  return (
    <Card className={`p-4 border border-border transition-all duration-500 ${config.bgClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <WeatherIcon className={`w-8 h-8 ${config.iconClass}`} />
        <span className="text-lg font-semibold text-foreground">
          {config.text}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Temperature:</span>
          <span className="font-medium text-foreground">{config.temp}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Visibility:</span>
          <span className="font-medium text-foreground">{config.visibility}</span>
        </div>
      </div>
    </Card>
  );
};