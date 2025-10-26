import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Circle,
  Map,
  Mic,
  Radio,
  ScrollText,
  Video,
  Volume2,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const demoCases = [
  {
    id: 1,
    mission: "ORBIT-02",
    severity: "low",
    people_count: 2,
    weapon_detected: 0,
    subjects: [],
    summary: "Routine domestic call. Two unarmed individuals detected.",
    videoSrc: "/videos/drone_feed.mp4",
  },
  {
    id: 2,
    mission: "ORBIT-02",
    severity: "medium",
    people_count: 3,
    weapon_detected: 1,
    subjects: [],
    summary:
      "Case ORBIT-02: Three individuals near loading bay. One low-confidence sidearm outline.",
    videoSrc: null,
  },
  {
    id: 3,
    mission: "ORBIT-02",
    severity: "high",
    people_count: 1,
    weapon_detected: 1,
    subjects: [{ name: "John Doe" }],
    summary:
      "Known offender John Doe armed. Backup required. Engage high alert protocol.",
    videoSrc: null,
  },
];

const severityStyles = {
  low: {
    label: "LOW THREAT",
    color: "#16f195",
  },
  medium: {
    label: "MEDIUM THREAT",
    color: "#ffa500",
  },
  high: {
    label: "HIGH THREAT",
    color: "#ff4b4b",
  },
};

const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const ThreatDashboard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [syncTimer, setSyncTimer] = useState(0);
  const [view, setView] = useState("drone");
  const [audioSrc, setAudioSrc] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const audioRef = useRef(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);

  const activeCase = demoCases[activeIndex];

  useEffect(() => {
    const rotation = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoCases.length);
    }, 10000);
    return () => clearInterval(rotation);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  const severity = useMemo(
    () => severityStyles[activeCase.severity] ?? severityStyles.low,
    [activeCase.severity]
  );

  const handleReadBriefing = async () => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "";

    if (!apiKey) {
      setTtsError("Missing OpenAI API key.");
      return;
    }

    setIsReading(true);
    setTtsError("");

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: "alloy",
          input: activeCase.summary,
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const audioData = await response.arrayBuffer();
      const blob = new Blob([audioData], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }

      setAudioSrc(url);

      requestAnimationFrame(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current
            .play()
            .catch(() => {
              /* Playback requires user gesture */
            });
        }
      });
    } catch (error) {
      setTtsError(
        error instanceof Error ? error.message : "Unable to generate briefing."
      );
    } finally {
      setIsReading(false);
    }
  };

  useEffect(() => {
    if (view !== "map") {
      return;
    }
    setMapUnavailable(false);
  }, [view]);

  const renderPrimaryView = () => {
    if (view === "map") {
      return (
        <>
          {/* TODO: replace src with /src/assets/images/map_view.jpg */}
          {mapUnavailable ? (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm uppercase tracking-[0.5em] text-white/50">
                MAP DATA UNAVAILABLE.
              </span>
            </div>
          ) : (
            <img
              alt="Mission Map"
              className="h-full w-full object-cover"
              src="/src/assets/images/map_view.jpg"
              onError={() => setMapUnavailable(true)}
            />
          )}
        </>
      );
    }

    if (view === "summary") {
      return (
        <div className="flex h-full w-full items-center justify-center px-12 text-center">
          <p className="text-3xl font-semibold leading-relaxed text-white">
            {activeCase.summary}
          </p>
        </div>
      );
    }

    return activeCase.videoSrc ? (
      <video
        className="h-full w-full rounded-lg object-cover"
        src={activeCase.videoSrc}
        muted
        loop
        autoPlay
      ></video>
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-sm uppercase tracking-[0.5em] text-white/50">
          NO SIGNAL DETECTED
        </span>
      </div>
    );
  };

  const primaryViewButtons = [
    { key: "drone", label: "Drone View", icon: Video },
    { key: "map", label: "Map", icon: Map },
    { key: "summary", label: "AI Summary", icon: ScrollText },
  ];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0f] text-white">
      <header className="flex h-[10vh] items-center justify-between border-b border-white/10 bg-white/5 px-8 backdrop-blur-md shadow-lg">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">
            DRONE AI THREAT DASHBOARD
          </p>
          <h1 className="text-3xl font-semibold text-white">Command Uplink</h1>
        </div>
        <div className="text-right">
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Mission {activeCase.mission}
          </p>
          <p className="text-3xl font-mono">{formatTimer(syncTimer)}</p>
          <p className="text-xs text-white/50">Auto rotation every 10 seconds</p>
        </div>
      </header>

      <main className="flex h-[70vh] gap-4 px-4">
        <section className="flex flex-[2] flex-col overflow-hidden rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg">
          <div className="mb-3 flex items-center justify-between text-sm text-white/70">
            <span className="uppercase tracking-[0.4em]">
              {view === "drone"
                ? "Drone Feed"
                : view === "map"
                ? "Mission Map"
                : "AI Summary"}
            </span>
            <span className="uppercase tracking-[0.3em] text-white/50">
              {view === "drone" ? "LIVE" : view === "map" ? "TACTICAL" : "INTEL"}
            </span>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-2xl bg-black/70">
            <div className="absolute inset-0 h-full w-full transition-opacity duration-300">
              {renderPrimaryView()}
            </div>
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3 rounded-full bg-black/50 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
              <Circle className="h-3 w-3 text-[#ff4b4b]" />
              <span>REC</span>
              <Wifi className="h-3 w-3 text-white/60" />
            </div>
          </div>
        </section>

        <section className="flex flex-[1] flex-col overflow-hidden">
          <div
            className={cn(
              "flex w-full flex-shrink-0 flex-col rounded-3xl p-4 shadow-lg backdrop-blur-lg",
              activeCase.severity === "high" ? "animate-pulse" : ""
            )}
            style={{
              backgroundColor: `${severity.color}20`,
              border: `1px solid ${severity.color}40`,
              height: "12vh",
            }}
          >
            <div className="flex items-center justify-between text-sm uppercase tracking-[0.4em]">
              <span>Threat Level</span>
              <span style={{ color: severity.color }}>{severity.label}</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-lg font-semibold">
              <p>Current Severity</p>
              <div
                className="h-2 w-24 rounded-full"
                style={{ backgroundColor: severity.color }}
              />
            </div>
          </div>

          <div
            className="mt-0 flex w-full flex-shrink-0 flex-col rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg"
            style={{ height: "50vh" }}
          >
            <div className="text-xs uppercase tracking-[0.4em] text-white/60">
              Subjects
            </div>
            <div className="mt-3 h-full overflow-hidden rounded-2xl bg-black/30 p-4">
              {activeCase.subjects.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm uppercase tracking-[0.4em] text-white/50">
                  No subject detected
                </div>
              ) : (
                <div className="grid h-full grid-cols-2 gap-4 overflow-auto">
                  {activeCase.subjects.map((subject) => (
                    <div
                      key={subject.name}
                      className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-4 text-center"
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-black/50">
                        {subject.image ? (
                          <img
                            alt={subject.name}
                            className="h-full w-full object-cover"
                            src={subject.image}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.3em] text-white/40">
                            {/* TODO: replace src with /src/assets/images/subject1.jpg */}
                            No Image
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold">{subject.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div
            className="mt-0 flex w-full flex-shrink-0 items-center justify-between rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg"
            style={{ height: "8vh" }}
          >
            <div className="flex flex-1 flex-col">
              <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                People Detected
              </span>
              <span className="text-2xl font-semibold text-white">
                {activeCase.people_count}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="text-xs uppercase tracking-[0.3em] text-white/60">
                Weapons Detected
              </span>
              <span className="text-2xl font-semibold text-white">
                {activeCase.weapon_detected}
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex h-[20vh] items-center gap-6 px-6 pb-4">
        <div className="flex h-full flex-1 flex-col justify-between overflow-hidden rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg">
          <div className="grid grid-cols-4 gap-4">
            {primaryViewButtons.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => setView(key)}
                className={cn(
                  "flex h-16 flex-col items-center justify-center rounded-2xl border border-white/10 text-xs uppercase tracking-[0.3em] transition",
                  view === key
                    ? "bg-white text-black shadow-[0_0_25px_rgba(22,241,149,0.45)]"
                    : "bg-white/10 text-white shadow-lg hover:bg-white/20"
                )}
              >
                <Icon className="mb-2 h-5 w-5" />
                <span className="text-[0.7rem] text-center">{label}</span>
              </Button>
            ))}
            <Button
              onClick={handleReadBriefing}
              disabled={isReading}
              className={cn(
                "flex h-16 flex-col items-center justify-center rounded-2xl border border-white/10 text-xs uppercase tracking-[0.3em] transition",
                isReading
                  ? "bg-white text-black shadow-[0_0_25px_rgba(22,241,149,0.45)]"
                  : "bg-white/10 text-white shadow-lg hover:bg-white/20"
              )}
            >
              <Volume2 className="mb-2 h-5 w-5" />
              <span className="text-[0.7rem] text-center">Read Briefing (TTS)</span>
            </Button>
          </div>
          <div className="mt-4 flex flex-1 items-center justify-between rounded-2xl bg-black/40 p-4">
            <div className="max-w-[60%] space-y-2 text-sm text-white/70">
              <p className="uppercase tracking-[0.3em] text-white/50">
                Briefing Summary
              </p>
              <p className="leading-relaxed">{activeCase.summary}</p>
              {ttsError && <p className="text-xs text-[#ff4b4b]">{ttsError}</p>}
            </div>
            <div className="flex w-56 flex-col gap-2">
              <audio
                ref={audioRef}
                controls
                src={audioSrc}
                className="w-full rounded-xl bg-black/60"
              />
              <span className="text-[0.65rem] text-white/40">
                Audio generated via OpenAI Text-to-Speech
              </span>
            </div>
          </div>
        </div>
        <div className="flex h-full w-64 flex-col gap-4 rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg">
          <Button className="flex flex-1 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg transition hover:bg-white/20">
            <Radio className="mr-3 h-6 w-6" />
            <span className="text-sm uppercase tracking-[0.3em]">Drone Negotiation</span>
          </Button>
          <Button className="flex flex-1 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg transition hover:bg-white/20">
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ThreatDashboard;
