import React from 'react';
import { cn } from '@/lib/utils';
import type { SignalType } from './LocomotiveDashboard';

interface SignalIndicatorProps {
  currentSignal: SignalType;
}

export const SignalIndicator: React.FC<SignalIndicatorProps> = ({ currentSignal }) => {
  const signalConfig = {
    red: {
      text: 'STOP',
      bgClass: 'bg-signal-red/20',
      textClass: 'text-signal-red',
      shadowClass: 'shadow-[0_0_30px] shadow-signal-red/50',
    },
    yellow: {
      text: 'CAUTION',
      bgClass: 'bg-signal-yellow/20',
      textClass: 'text-signal-yellow',
      shadowClass: 'shadow-[0_0_30px] shadow-signal-yellow/50',
    },
    green: {
      text: 'GO',
      bgClass: 'bg-signal-green/20',
      textClass: 'text-signal-green',
      shadowClass: 'shadow-[0_0_30px] shadow-signal-green/50',
    },
  };

  const config = signalConfig[currentSignal];

  return (
    <div
      className={cn(
        "w-full max-w-sm h-32 rounded-xl border-2 flex items-center justify-center",
        "font-bold text-4xl transition-all duration-500 animate-pulse-glow",
        config.bgClass,
        config.textClass,
        config.shadowClass,
        currentSignal === 'red' ? 'border-signal-red' : 
        currentSignal === 'yellow' ? 'border-signal-yellow' : 'border-signal-green'
      )}
    >
      {config.text}
    </div>
  );
};