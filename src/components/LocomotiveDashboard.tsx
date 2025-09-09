import React, { useState, useEffect, useCallback } from "react";
import { SignalIndicator } from "./SignalIndicator";
import { RouteMap } from "./RouteMap";
import { EventLog } from "./EventLog";
import { WeatherPanel } from "./WeatherPanel";
import { SpeedPanel } from "./SpeedPanel";
import { Card } from "@/components/ui/card";

export type SignalType = "red" | "yellow" | "green";
export type WeatherType = "clear" | "rain" | "fog" | "storm";

export interface EventLogEntry {
  id: string;
  timestamp: Date;
  type: "signal" | "speed" | "weather" | "controller" | "station";
  message: string;
  audioUrl?: string;
  priority: "low" | "medium" | "high" | "critical";
}

export interface Station {
  name: string;
  position: number;
}

export interface TrackSignal {
  id: string;
  position: number;
  state: SignalType;
  track: number;
}

const LocomotiveDashboard: React.FC = () => {
  const [currentSignal, setCurrentSignal] = useState<SignalType>("green");
  const [currentWeather, setCurrentWeather] = useState<WeatherType>("clear");
  const [trainProgress, setTrainProgress] = useState(25);
  const [currentTrack, setCurrentTrack] = useState(1);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([
    {
      id: "init-1",
      timestamp: new Date(Date.now() - 30000),
      type: "controller",
      message:
        "Control Room: Vande Bharat 12951 cleared for departure from New Delhi - maintain schedule.",
      priority: "medium",
      audioUrl:
        "tts:Control room to Vande Bharat 12951. You are cleared for departure from New Delhi. Maintain your scheduled timing. Have a safe journey.",
    },
    {
      id: "init-2",
      timestamp: new Date(Date.now() - 15000),
      type: "signal",
      message:
        "Signal GREEN: Main line clear for departure - proceed at authorized speed.",
      priority: "medium",
      audioUrl:
        "tts:Signal confirmation for Vande Bharat 12951. Green signal displayed. Main line clear for departure. Proceed at authorized speed.",
    },
    {
      id: "init-3",
      timestamp: new Date(Date.now() - 5000),
      type: "station",
      message:
        "New Delhi departure: All systems normal - journey commenced successfully.",
      priority: "low",
      audioUrl:
        "tts:Departure confirmation for Vande Bharat 12951. All systems normal. Journey commenced successfully from New Delhi.",
    },
  ]);
  const [controllerMessage, setControllerMessage] = useState(
    "All systems operational. Maintain current speed and scheduled timing. Next checkpoint: Mathura Junction."
  );
  const [controllerAudioUrl, setControllerAudioUrl] = useState<string | null>(
    "tts:Control to Vande Bharat 12951. All systems operational. Maintain current speed and scheduled timing. Next checkpoint is Mathura Junction."
  );
  const [currentAudio, setCurrentAudio] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const stations: Station[] = [
    { name: "New Delhi", position: 0 },
    { name: "Mathura Jn", position: 25 },
    { name: "Agra Cantt", position: 50 },
    { name: "Gwalior Jn", position: 75 },
    { name: "Jhansi Jn", position: 100 },
  ];

  const trackSignals: TrackSignal[] = [
    { id: "signal-1", position: 35, state: "green", track: 1 },
    { id: "signal-2", position: 60, state: "yellow", track: 2 },
    { id: "signal-3", position: 85, state: "red", track: 2 },
  ];

  const addEventLog = useCallback(
    (entry: Omit<EventLogEntry, "id" | "timestamp">) => {
      const newEntry: EventLogEntry = {
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };
      setEventLog((prev) => [newEntry, ...prev].slice(0, 50)); // Keep last 50 events
    },
    []
  );

  const playEventAudio = useCallback(
    (audioUrl: string) => {
      try {
        // Stop any currently playing audio
        if (isAudioPlaying && currentAudio) {
          speechSynthesis.cancel();
          setCurrentAudio(null);
          setIsAudioPlaying(false);
          return; // If audio was playing, just stop it
        }

        if (audioUrl.startsWith("tts:")) {
          // Text-to-speech for railway announcements
          const text = audioUrl.replace("tts:", "");
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            // Handle speech end
            utterance.onend = () => {
              setCurrentAudio(null);
              setIsAudioPlaying(false);
            };

            utterance.onerror = () => {
              setCurrentAudio(null);
              setIsAudioPlaying(false);
            };

            // Try to use a more authoritative voice
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(
              (voice) =>
                voice.name.includes("David") ||
                voice.name.includes("Mark") ||
                voice.name.includes("Male") ||
                voice.lang.includes("en-GB") ||
                voice.lang.includes("en-US")
            );
            if (preferredVoice) {
              utterance.voice = preferredVoice;
            }

            setCurrentAudio(utterance);
            setIsAudioPlaying(true);
            speechSynthesis.speak(utterance);
          }
        } else {
          const audio = new Audio(audioUrl);
          audio.volume = 0.7;
          audio.onended = () => {
            setIsAudioPlaying(false);
          };
          audio.onerror = () => {
            setIsAudioPlaying(false);
          };
          setIsAudioPlaying(true);
          audio.play().catch(console.error);
        }
      } catch (error) {
        console.error("Failed to play audio:", error);
        setIsAudioPlaying(false);
      }
    },
    [isAudioPlaying, currentAudio]
  );

  // Simulate real-time updates
  useEffect(() => {
    const signalInterval = setInterval(() => {
      const signals: SignalType[] = [
        "green",
        "yellow",
        "red",
        "green",
        "green",
      ];
      const newSignal = signals[Math.floor(Math.random() * signals.length)];
      if (newSignal !== currentSignal) {
        setCurrentSignal(newSignal);
        const signalMessages = {
          red: "STOP SIGNAL: Line section occupied. Halt immediately and await clearance.",
          yellow:
            "CAUTION SIGNAL: Proceed at restricted speed 30 km/h. Next signal not clear.",
          green:
            "CLEAR SIGNAL: Main line clear. Proceed at authorized maximum speed.",
        };
        const signalAudio = {
          red: "tts:Attention Vande Bharat 12951. Stop signal displayed. Line section occupied. Halt immediately and await clearance from control.",
          yellow:
            "tts:Caution signal for Vande Bharat 12951. Proceed at restricted speed 30 kilometers per hour. Next signal not clear.",
          green:
            "tts:Clear signal confirmed for Vande Bharat 12951. Main line clear. Proceed at authorized maximum speed.",
        };
        addEventLog({
          type: "signal",
          message: `Signal ${newSignal.toUpperCase()}: ${
            signalMessages[newSignal]
          }`,
          priority:
            newSignal === "red"
              ? "critical"
              : newSignal === "yellow"
              ? "high"
              : "medium",
          audioUrl: signalAudio[newSignal],
        });
      }
    }, 8000);

    const weatherInterval = setInterval(() => {
      const weathers: WeatherType[] = ["clear", "rain", "fog", "storm"];
      const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
      if (newWeather !== currentWeather) {
        setCurrentWeather(newWeather);
        const weatherMessages = {
          clear: "Weather conditions clear - normal visibility and operations.",
          rain: "Light rainfall detected - monitor track conditions and braking distance.",
          fog: "Dense fog reported - visibility reduced, activate fog protocol.",
          storm:
            "Storm conditions - heavy rain and wind, reduce speed immediately.",
        };
        const weatherAudio = {
          clear:
            "tts:Weather update for Vande Bharat 12951. Conditions now clear. Normal visibility and operations restored.",
          rain: "tts:Weather advisory for Vande Bharat 12951. Light rainfall detected. Monitor track conditions and increase braking distance.",
          fog: "tts:Weather warning for Vande Bharat 12951. Dense fog reported ahead. Visibility reduced. Activate fog protocol immediately.",
          storm:
            "tts:Weather alert for Vande Bharat 12951. Storm conditions detected. Heavy rain and wind. Reduce speed immediately for safety.",
        };
        addEventLog({
          type: "weather",
          message: `Weather: ${weatherMessages[newWeather]}`,
          priority:
            newWeather === "storm" || newWeather === "fog" ? "high" : "low",
          audioUrl: weatherAudio[newWeather],
        });
      }
    }, 12000);

    const trainProgressInterval = setInterval(() => {
      setTrainProgress((prev) => {
        const newProgress = prev + 0.5;
        if (newProgress >= 100) {
          setCurrentStationIndex((curr) => (curr + 1) % stations.length);
          setCurrentTrack((curr) => (curr % 2) + 1);
          const nextStation =
            stations[(currentStationIndex + 1) % stations.length].name;
          addEventLog({
            type: "station",
            message: `Approaching ${nextStation} - prepare for scheduled halt.`,
            priority: "medium",
            audioUrl: `tts:Vande Bharat 12951 approaching ${nextStation} station. Prepare for scheduled halt. Passengers please be ready for boarding and alighting.`,
          });
          return 0;
        }
        return newProgress;
      });
    }, 300);

    const controllerInterval = setInterval(() => {
      const controllerUpdates = [
        {
          message: "Maintain current speed of 130 km/h and scheduled timing.",
          priority: "low" as const,
          audio:
            "tts:Control to Vande Bharat 12951. Maintain current speed of 130 kilometers per hour and scheduled timing. Over.",
        },
        {
          message:
            "Prepare for station approach - reduce to 80 km/h in 2 kilometers.",
          priority: "medium" as const,
          audio:
            "tts:Vande Bharat 12951, prepare for station approach. Reduce speed to 80 kilometers per hour in 2 kilometers. Acknowledge.",
        },
        {
          message:
            "URGENT: Track maintenance ahead - immediate speed restriction 40 km/h.",
          priority: "critical" as const,
          audio:
            "tts:URGENT INSTRUCTION for Vande Bharat 12951. Track maintenance ahead. Implement immediate speed restriction to 40 kilometers per hour. Acknowledge immediately.",
        },
        {
          message:
            "Weather advisory: Dense fog detected - activate fog lamps and reduce visibility speed.",
          priority: "high" as const,
          audio:
            "tts:Weather advisory for Vande Bharat 12951. Dense fog detected ahead. Activate fog lamps and reduce speed for visibility conditions. Report status.",
        },
        {
          message:
            "EMERGENCY: Medical assistance required at Agra Cantt - prepare for unscheduled halt.",
          priority: "critical" as const,
          audio:
            "tts:EMERGENCY instruction for Vande Bharat 12951. Medical assistance required at Agra Cantt station. Prepare for unscheduled halt. Medical team will board. Acknowledge.",
        },
        {
          message:
            "Platform delay at Mathura Junction - extend halt time by 5 minutes for passenger safety.",
          priority: "medium" as const,
          audio:
            "tts:Vande Bharat 12951, platform congestion reported at Mathura Junction. Extend halt time by 5 minutes for passenger safety. Maintain schedule thereafter.",
        },
        {
          message:
            "Signal system check complete - all green signals ahead for next 15 kilometers.",
          priority: "low" as const,
          audio:
            "tts:Vande Bharat 12951, signal system check complete. All green signals confirmed ahead for next 15 kilometers. Proceed with confidence.",
        },
        {
          message:
            "VIP movement protocol active - additional security checks at Gwalior Junction.",
          priority: "medium" as const,
          audio:
            "tts:Vande Bharat 12951, VIP movement protocol is now active. Additional security checks required at Gwalior Junction. Cooperate with security personnel.",
        },
        {
          message:
            "PRIORITY: Freight train crossing ahead - full stop required at signal 47B.",
          priority: "critical" as const,
          audio:
            "tts:PRIORITY instruction for Vande Bharat 12951. Freight train crossing ahead. Full stop required at signal 47 Bravo. Do not proceed until clearance given.",
        },
        {
          message:
            "Track clear - resume authorized speed of 160 km/h. Schedule recovery possible.",
          priority: "medium" as const,
          audio:
            "tts:Vande Bharat 12951, track is now clear. Resume authorized speed of 160 kilometers per hour. Schedule recovery is possible. Maintain safety protocols.",
        },
      ];
      const update =
        controllerUpdates[Math.floor(Math.random() * controllerUpdates.length)];
      setControllerMessage(update.message);
      setControllerAudioUrl(update.audio);
      addEventLog({
        type: "controller",
        message: `Control Room: ${update.message}`,
        priority: update.priority,
        audioUrl: update.audio,
      });
    }, 15000);

    // Add realistic railway events
    const eventInterval = setInterval(() => {
      const railwayEvents = [
        {
          type: "station" as const,
          message:
            "Mathura Junction: 8-minute delay due to platform congestion - maintain passenger safety protocols",
          priority: "high" as const,
          audio:
            "tts:Station update for Vande Bharat 12951. Mathura Junction reports 8 minute delay due to platform congestion. Maintain all passenger safety protocols during extended halt.",
        },
        {
          type: "weather" as const,
          message:
            "Meteorological alert: Dense fog detected at kilometer 67 - visibility reduced to 150 meters",
          priority: "high" as const,
          audio:
            "tts:Meteorological alert for Vande Bharat 12951. Dense fog detected at kilometer 67. Visibility reduced to 150 meters. Implement fog safety procedures immediately.",
        },
        {
          type: "signal" as const,
          message:
            "CRITICAL: Signal failure at Block Section 4B - proceed under written authority only",
          priority: "critical" as const,
          audio:
            "tts:CRITICAL alert for Vande Bharat 12951. Signal failure at Block Section 4 Bravo. Do not proceed without written authority from station master. Stop and await instructions.",
        },
        {
          type: "station" as const,
          message:
            "Agra Cantt: Medical emergency passenger assistance - standby for 4-minute additional halt",
          priority: "medium" as const,
          audio:
            "tts:Station announcement for Vande Bharat 12951. Medical emergency passenger assistance required at Agra Cantt. Standby for 4 minute additional halt for medical team.",
        },
        {
          type: "controller" as const,
          message:
            "URGENT: Engineering block ahead - speed restriction 25 km/h for track maintenance zone",
          priority: "critical" as const,
          audio:
            "tts:URGENT instruction for Vande Bharat 12951. Engineering block ahead. Implement immediate speed restriction to 25 kilometers per hour for track maintenance zone. Acknowledge receipt.",
        },
        {
          type: "weather" as const,
          message:
            "Heavy rainfall warning: Track monitoring active - report any unusual vibrations immediately",
          priority: "high" as const,
          audio:
            "tts:Heavy rainfall warning for Vande Bharat 12951. Track monitoring is now active. Report any unusual vibrations or track conditions immediately to control room.",
        },
        {
          type: "station" as const,
          message:
            "Gwalior Junction: VIP security protocol active - additional halt time 3 minutes for clearance",
          priority: "medium" as const,
          audio:
            "tts:Gwalior Junction security update for Vande Bharat 12951. VIP protocol is active. Additional halt time of 3 minutes required for security clearance procedures.",
        },
        {
          type: "controller" as const,
          message:
            "Track circuit failure reported - manual block working in effect between signals 12A and 14B",
          priority: "high" as const,
          audio:
            "tts:Control room to Vande Bharat 12951. Track circuit failure reported. Manual block working now in effect between signals 12 Alpha and 14 Bravo. Proceed with extreme caution.",
        },
        {
          type: "signal" as const,
          message:
            "Automatic block system restored - normal signaling resumed, proceed per signal indications",
          priority: "medium" as const,
          audio:
            "tts:System update for Vande Bharat 12951. Automatic block system has been restored. Normal signaling resumed. Proceed according to signal indications.",
        },
        {
          type: "station" as const,
          message:
            "Level crossing gate malfunction at km 89 - flagman posted, proceed at 10 km/h with continuous horn",
          priority: "critical" as const,
          audio:
            "tts:CRITICAL safety alert for Vande Bharat 12951. Level crossing gate malfunction at kilometer 89. Flagman posted. Proceed at 10 kilometers per hour with continuous horn.",
        },
        {
          type: "controller" as const,
          message:
            "Train 12952 (Up Vande Bharat) delayed by 15 minutes due to cattle on track near Firozabad - path clearing in progress",
          priority: "medium" as const,
          audio:
            "tts:Traffic update for Vande Bharat 12951. Train 12952 Up Vande Bharat delayed by 15 minutes due to cattle on track near Firozabad. Path clearing in progress.",
        },
        {
          type: "station" as const,
          message:
            "Bharatpur Junction: Point failure on main line - trains diverted to loop line, expect 6-minute delay",
          priority: "high" as const,
          audio:
            "tts:Bharatpur Junction operational alert for Vande Bharat 12951. Point failure on main line. Trains diverted to loop line. Expect 6 minute delay for route clearance.",
        },
        {
          type: "weather" as const,
          message:
            "Dust storm alert: Wind speed 65 km/h recorded near Mathura - reduced visibility protocols in effect",
          priority: "high" as const,
          audio:
            "tts:Weather alert for Vande Bharat 12951. Dust storm with wind speed 65 kilometers per hour recorded near Mathura. Reduced visibility protocols now in effect.",
        },
        {
          type: "signal" as const,
          message:
            "Signal 67B showing aspect failure - proceed past signal at 15 km/h after obtaining written authority",
          priority: "high" as const,
          audio:
            "tts:Signal alert for Vande Bharat 12951. Signal 67 Bravo showing aspect failure. Proceed past signal at 15 kilometers per hour after obtaining written authority from station controller.",
        },
        {
          type: "controller" as const,
          message:
            "Goods train 16543 derailed at Etawah yard - main line unaffected, passenger services continuing normally",
          priority: "low" as const,
          audio:
            "tts:Incident report for Vande Bharat 12951. Goods train 16543 derailed at Etawah yard. Main line unaffected. Passenger services continuing normally.",
        },
        {
          type: "station" as const,
          message:
            "Agra Cantt: Platform 2 overhead cable snapped - trains redirected to Platform 3, minimal delay expected",
          priority: "medium" as const,
          audio:
            "tts:Agra Cantt infrastructure alert for Vande Bharat 12951. Platform 2 overhead cable snapped. Trains redirected to Platform 3. Minimal delay expected for platform change.",
        },
        {
          type: "controller" as const,
          message:
            "PRIORITY: Rajdhani Express 12002 running 45 minutes late - path priority maintained for Vande Bharat services",
          priority: "low" as const,
          audio:
            "tts:Traffic coordination for Vande Bharat 12951. Rajdhani Express 12002 running 45 minutes late. Path priority maintained for Vande Bharat services.",
        },
        {
          type: "weather" as const,
          message:
            "Temperature alert: 47°C recorded at Gwalior - monitor traction motor temperatures closely",
          priority: "medium" as const,
          audio:
            "tts:Temperature alert for Vande Bharat 12951. 47 degrees Celsius recorded at Gwalior. Monitor traction motor temperatures closely for overheating protection.",
        },
        {
          type: "station" as const,
          message:
            "Jhansi Junction: Track renewal work on line 2 - speed restriction 40 km/h through station premises",
          priority: "medium" as const,
          audio:
            "tts:Jhansi Junction maintenance alert for Vande Bharat 12951. Track renewal work on line 2. Speed restriction 40 kilometers per hour through station premises.",
        },
        {
          type: "controller" as const,
          message:
            "Emergency brake application by freight train ahead - section clear now, resume normal operations",
          priority: "high" as const,
          audio:
            "tts:Section clearance for Vande Bharat 12951. Emergency brake application by freight train ahead resolved. Section clear now. Resume normal operations immediately.",
        },
        {
          type: "signal" as const,
          message:
            "All clear: Block section completely restored - automatic signaling functioning normally",
          priority: "low" as const,
          audio:
            "tts:All clear announcement for Vande Bharat 12951. Block section completely restored. Automatic signaling functioning normally. Proceed according to signal aspects.",
        },
      ];

      const event =
        railwayEvents[Math.floor(Math.random() * railwayEvents.length)];
      addEventLog({
        type: event.type,
        message: event.message,
        priority: event.priority,
        audioUrl: event.audio,
      });
    }, 18000);

    return () => {
      clearInterval(signalInterval);
      clearInterval(weatherInterval);
      clearInterval(trainProgressInterval);
      clearInterval(controllerInterval);
      clearInterval(eventInterval);
    };
  }, [
    currentSignal,
    currentWeather,
    currentStationIndex,
    stations,
    addEventLog,
  ]);

  return (
    <div className="min-h-screen bg-background p-4 pr-0">
      <div className="max-w-none mx-auto grid grid-cols-1 lg:grid-cols-4 gap-4 gap-x-6">
        {/* Main Dashboard - Left Side */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-screen">
          {/* Header */}
          <div className="flex justify-between items-center py-2">
            <div className="text-2xl font-bold text-primary">Train 12951</div>
            <div className="text-2xl font-bold text-primary">
              Vande Bharat Express
            </div>
          </div>

          {/* Main Control Area */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[220px]">
            {/* Speed Panel */}
            <div className="md:col-span-1">
              <SpeedPanel
                currentSignal={currentSignal}
                currentWeather={currentWeather}
              />
            </div>

            {/* Signal Indicator - Center */}
            <div className="md:col-span-1 flex items-center justify-center">
              <SignalIndicator currentSignal={currentSignal} />
            </div>

            {/* Weather Panel */}
            <div className="md:col-span-1">
              <WeatherPanel currentWeather={currentWeather} />
            </div>
          </div>

          {/* Route Map */}
          <div className="h-48 mb-4">
            <RouteMap
              stations={stations}
              trainProgress={trainProgress}
              currentTrack={currentTrack}
              trackSignals={trackSignals}
              currentStationIndex={currentStationIndex}
            />
          </div>

          {/* Controller Instructions */}
          <div className="mt-auto">
            <Card
              className="p-4 bg-dashboard-panel border-border cursor-pointer hover:bg-dashboard-panel/80 transition-colors group"
              onClick={() =>
                controllerAudioUrl && playEventAudio(controllerAudioUrl)
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                  📻 CONTROLLER INSTRUCTIONS
                  {controllerAudioUrl && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isAudioPlaying
                          ? "bg-red-500 animate-pulse"
                          : "bg-signal-green animate-pulse"
                      }`}
                    ></div>
                  )}
                </h3>
                {controllerAudioUrl && (
                  <div className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    🔊 {isAudioPlaying ? "Click to stop" : "Click to play"}{" "}
                    audio
                  </div>
                )}
              </div>
              <p className="text-base font-medium">{controllerMessage}</p>
              {controllerAudioUrl && (
                <div className="mt-2 text-xs font-medium">
                  <span
                    className={
                      isAudioPlaying ? "text-red-500" : "text-signal-green"
                    }
                  >
                    ●{" "}
                    {isAudioPlaying ? "AUDIO PLAYING" : "LIVE AUDIO AVAILABLE"}
                  </span>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Event Log - Right Side - Full Width */}
        <div className="lg:col-span-1 pr-4">
          <EventLog
            events={eventLog}
            onPlayAudio={playEventAudio}
            isAudioPlaying={isAudioPlaying}
          />
        </div>
      </div>
    </div>
  );
};

export default LocomotiveDashboard;
