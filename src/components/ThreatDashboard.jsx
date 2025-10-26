import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    severity: "medium",
    people_count: 3,
    weapon_detected: 0,
    subjects: [],
    summary:
      "Caller reports disturbance; three people inside; no confirmed weapon on call.",
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
  // demo selection state replaces auto-rotation
  const [demoSelected, setDemoSelected] = useState(1);
  // reactive case data for demo updates (weapon detection, etc.)
  const [casesState, setCasesState] = useState(() =>
    demoCases.map((caseItem) => ({ ...caseItem }))
  );
  const [syncTimer, setSyncTimer] = useState(0);
  // view control between drone/map/summary
  const [view, setView] = useState("drone");
  const [audioSrc, setAudioSrc] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const audioRef = useRef(null);
  const [mapUnavailable, setMapUnavailable] = useState(false);
  // drone mission phase tracking for demo logic
  const [dronePhase, setDronePhase] = useState("IDLE");
  // countdown timer in seconds for drone trip
  const [tripSeconds, setTripSeconds] = useState(0);
  // simulated detection flag
  const [weaponDetected, setWeaponDetected] = useState(false);
  // toast feedback for unavailable actions
  const [notice, setNotice] = useState("");
  // video fallback state for drone feed errors
  const [videoError, setVideoError] = useState(false);
  const noticeTimeoutRef = useRef(null);

  const activeCase = useMemo(
    () => casesState.find((caseItem) => caseItem.id === demoSelected) ?? casesState[0],
    [casesState, demoSelected]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (noticeTimeoutRef.current) {
      clearTimeout(noticeTimeoutRef.current);
    }
    if (!notice) {
      return;
    }
    noticeTimeoutRef.current = setTimeout(() => setNotice(""), 3000);
    return () => {
      if (noticeTimeoutRef.current) {
        clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, [notice]);

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
    const apiKey = process.env.OPENAI_API_KEY || "";

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

  useEffect(() => {
    // reset demo state whenever a new demo is selected
    const baseCase = demoCases.find((item) => item.id === demoSelected);
    if (!baseCase) {
      return;
    }

    setCasesState((prev) =>
      prev.map((caseItem) =>
        caseItem.id === demoSelected ? { ...baseCase } : caseItem
      )
    );
    setWeaponDetected(false);
    setNotice("");

    if (demoSelected === 1) {
      // kick off the scripted trip for demo 1
      setDronePhase("EN_ROUTE");
      setTripSeconds(90);
      setVideoError(false);
    } else {
      setDronePhase("IDLE");
      setTripSeconds(0);
      setVideoError(false);
    }
  }, [demoSelected]);

  useEffect(() => {
    if (dronePhase !== "EN_ROUTE") {
      return;
    }

    if (tripSeconds <= 0) {
      setDronePhase("SCANNING");
      return;
    }

    const interval = setInterval(() => {
      setTripSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDronePhase("SCANNING");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [dronePhase, tripSeconds]);

  useEffect(() => {
    if (dronePhase !== "SCANNING" || demoSelected !== 1 || weaponDetected) {
      return;
    }

    // simulate scanning detection for demo 1 (replace with real detection feed)
    const detectionTimeout = setTimeout(() => {
      setWeaponDetected(true);
      setCasesState((prev) =>
        prev.map((caseItem) =>
          caseItem.id === 1
            ? { ...caseItem, weapon_detected: 1, severity: "high" }
            : caseItem
        )
      );
    }, 6000);

    return () => clearTimeout(detectionTimeout);
  }, [dronePhase, demoSelected, weaponDetected]);

  const updatePhaseData = useCallback(
    (phase) => {
      const applyPhaseUpdates = (updates) => {
        setCasesState((prev) => {
          let changed = false;
          const next = prev.map((caseItem) => {
            if (caseItem.id !== 1) {
              return caseItem;
            }

            const subjectsMatch =
              JSON.stringify(caseItem.subjects) ===
              JSON.stringify(updates.subjects ?? caseItem.subjects);

            const matches =
              caseItem.severity === updates.severity &&
              caseItem.people_count === updates.people_count &&
              caseItem.weapon_detected === updates.weapon_detected &&
              subjectsMatch;

            if (matches) {
              return caseItem;
            }

            changed = true;
            return {
              ...caseItem,
              ...updates,
            };
          });

          return changed ? next : prev;
        });
      };

      if (phase === "EN_ROUTE") {
        if (demoSelected === 1) {
          applyPhaseUpdates({
            severity: "medium",
            people_count: 3,
            weapon_detected: 0,
            subjects: [],
          });
        }
        setWeaponDetected(false);
      } else if (phase === "SCANNING") {
        if (demoSelected === 1) {
          applyPhaseUpdates({
            severity: "high",
            people_count: 5,
            weapon_detected: 1,
            subjects: [
              { name: "Subject A", img: "/images/subject1.jpg" },
              { name: "Subject B", img: "/images/subject2.jpg" },
            ],
          });
        }
        setWeaponDetected(true);
      } else if (phase === "NEGOTIATION") {
        if (demoSelected === 1) {
          applyPhaseUpdates({
            severity: "high",
            people_count: 5,
            weapon_detected: 1,
            subjects: [
              { name: "Subject A", img: "/images/subject1.jpg" },
              { name: "Subject B", img: "/images/subject2.jpg" },
            ],
          });
        }
        setWeaponDetected(true);
      }
    },
    [demoSelected]
  );

  const handlePhaseChange = (phase) => {
    setDronePhase(phase);
    setVideoError(false);
    updatePhaseData(phase);
  };

  const handleSelectDemo = (id) => {
    setDemoSelected(id);
    setView("drone");
  };

  const handleNegotiation = () => {
    if (dronePhase === "SCANNING" && weaponDetected) {
      setDronePhase("NEGOTIATION");
      setNotice("");
      return;
    }

    setNotice("Negotiation unavailable — no confirmed threat.");
  };

  const tripTimerDisplay = formatTimer(tripSeconds);
  const negotiationUnlocked = dronePhase === "SCANNING" && weaponDetected;

  useEffect(() => {
    // reset video fallback message when phase updates
    setVideoError(false);
  }, [dronePhase]);

  useEffect(() => {
    if (demoSelected !== 1) {
      return;
    }

    if (
      dronePhase === "EN_ROUTE" ||
      dronePhase === "SCANNING" ||
      dronePhase === "NEGOTIATION"
    ) {
      updatePhaseData(dronePhase);
    }
  }, [demoSelected, dronePhase, updatePhaseData]);

  const phaseVideoSources = {
    EN_ROUTE: "/videos/drone_enroute.mp4",
    SCANNING: "/videos/drone_scanning.mp4",
    NEGOTIATION: "/videos/drone_negotiation.mp4",
  };

  const renderDronePhase = () => {
    const videoSrc = phaseVideoSources[dronePhase];

    if (!videoSrc) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-sm uppercase tracking-[0.5em] text-white/50">
            DRONE STANDING BY
          </span>
        </div>
      );
    }

    return (
      <div className="relative h-full w-full">
        <video
          key={dronePhase}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
          onError={() => setVideoError(true)}
          onLoadedData={() => setVideoError(false)}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/80 text-sm uppercase tracking-[0.3em] text-white/70">
            NO SIGNAL DETECTED
          </div>
        )}
      </div>
    );
  };

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

    return renderDronePhase();
  };

  const primaryViewButtons = [
    { key: "drone", label: "Drone View", icon: Video },
    { key: "map", label: "Map", icon: Map },
    { key: "summary", label: "AI Summary", icon: ScrollText },
  ];

  const demoButtons = [
    { id: 1, label: "Demo 1" },
    { id: 2, label: "Demo 2" },
    { id: 3, label: "Demo 3" },
  ];

  const phaseButtons = ["EN_ROUTE", "SCANNING", "NEGOTIATION"];

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0f] text-white">
      <header className="flex h-[10vh] items-center justify-between border-b border-white/10 bg-white/5 px-8 backdrop-blur-md shadow-lg">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.6em] text-white/60">
            # T.H.R.E.A.T.
          </p>
          <h1 className="text-3xl font-semibold text-white">
            T.H.R.E.A.T. – Tactical Hazard Recognition and Evaluation for Agent
            Safety
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2 text-right">
          <div className="flex items-center gap-2">
            {demoButtons.map(({ id, label }) => (
              <Button
                key={id}
                size="default"
                onClick={() => handleSelectDemo(id)}
                className={cn(
                  "h-9 rounded-xl border border-white/20 bg-white/10 px-4 text-xs uppercase tracking-[0.3em]",
                  demoSelected === id
                    ? "bg-white text-black shadow-[0_0_15px_rgba(22,241,149,0.35)]"
                    : "text-white hover:bg-white/20"
                )}
              >
                {label}
              </Button>
            ))}
            <div className="ml-4 flex items-center gap-2">
              {phaseButtons.map((phase) => (
                <Button
                  key={phase}
                  size="default"
                  onClick={() => handlePhaseChange(phase)}
                  className={cn(
                    "h-9 rounded-xl border border-white/20 bg-white/5 px-3 text-[0.6rem] uppercase tracking-[0.3em]",
                    dronePhase === phase
                      ? "bg-white/30 text-white shadow-[0_0_12px_rgba(22,241,149,0.35)]"
                      : "text-white/60 hover:bg-white/15"
                  )}
                >
                  Phase: {phase.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm uppercase tracking-[0.4em] text-white/60">
            Mission {activeCase.mission}
          </p>
          <p className="text-3xl font-mono">{formatTimer(syncTimer)}</p>
          {dronePhase === "EN_ROUTE" ? (
            <p className="text-xs text-emerald-300/80">
              Trip ETA: {tripTimerDisplay}
            </p>
          ) : dronePhase === "SCANNING" ? (
            <p className="text-xs text-emerald-300/80">Drone scanning on-site</p>
          ) : dronePhase === "NEGOTIATION" ? (
            <p className="text-xs text-emerald-300/80">Negotiation channel active</p>
          ) : (
            <p className="text-xs text-white/50">Awaiting drone tasking</p>
          )}
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
            {view === "drone" && (
              <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end gap-1 text-xs uppercase tracking-[0.3em] text-white/70">
                <span className="rounded-full bg-black/60 px-3 py-1">
                  {dronePhase.replace("_", " ")}
                </span>
                {dronePhase === "EN_ROUTE" && (
                  <span className="rounded-full bg-black/40 px-3 py-1 font-mono text-sm">
                    {tripTimerDisplay}
                  </span>
                )}
              </div>
            )}
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
                  {activeCase.subjects.map((subject) => {
                    const imageSrc = subject.img ?? subject.image;

                    return (
                      <div
                        key={subject.name}
                        className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/5 p-4 text-center"
                      >
                        <div className="h-16 w-16 overflow-hidden rounded-full bg-black/50">
                          {imageSrc ? (
                            <img
                              alt={subject.name}
                              className="h-full w-full object-cover"
                              src={imageSrc}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[0.55rem] uppercase tracking-[0.3em] text-white/40">
                              No Image
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold">{subject.name}</p>
                      </div>
                    );
                  })}
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

      <footer className="relative flex h-[20vh] items-center gap-6 px-6 pb-4">
        <div className="flex h-full flex-1 flex-col gap-4 overflow-hidden rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg">
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
          {ttsError && (
            <div className="rounded-2xl bg-black/60 p-3 text-xs text-[#ff4b4b]">
              {ttsError}
            </div>
          )}
          <audio ref={audioRef} src={audioSrc} className="hidden" />
        </div>
        <div className="flex h-full w-64 flex-col gap-4 rounded-3xl bg-white/5 p-4 shadow-lg backdrop-blur-lg">
          <div className="relative flex flex-1">
            <Button
              disabled={!negotiationUnlocked}
              onClick={handleNegotiation}
              className={cn(
                "relative flex h-full w-full items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg transition hover:bg-white/20",
                negotiationUnlocked
                  ? "border-2 border-emerald-400 shadow-[0_0_25px_rgba(22,241,149,0.45)]"
                  : "opacity-60"
              )}
            >
              <Radio className="mr-3 h-6 w-6" />
              <span className="text-sm uppercase tracking-[0.3em]">Drone Negotiation</span>
              {negotiationUnlocked && (
                <span className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[0.6rem] font-bold text-black animate-ping">
                  ●
                </span>
              )}
            </Button>
            {!negotiationUnlocked && (
              <button
                type="button"
                onClick={() => setNotice("Negotiation unavailable — no confirmed threat.")}
                className="absolute inset-0 cursor-not-allowed rounded-2xl bg-transparent"
              >
                <span className="sr-only">Negotiation locked</span>
              </button>
            )}
          </div>
          <Button className="flex flex-1 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg transition hover:bg-white/20">
            <Mic className="h-6 w-6" />
          </Button>
        </div>
        {notice && (
          <div className="pointer-events-none absolute bottom-6 right-6 rounded-2xl bg-black/80 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
            {notice}
          </div>
        )}
      </footer>
    </div>
  );
};

export default ThreatDashboard;
