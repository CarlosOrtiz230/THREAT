import React, { useEffect, useMemo, useRef, useState } from "react";
import droneFeed from "@/assets/videos/drone_feed.mp4";
import {
  AlertTriangle,
  Map,
  Mic,
  Radio,
  ScrollText,
  Target,
  Users,
  Video,
  Volume2,
  WifiOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const THREAT_META = {
  low: {
    label: "Low Threat",
    accent: "text-[#16f195]",
    indicator: "bg-[#16f195]",
  },
  medium: {
    label: "Medium Threat",
    accent: "text-[#ffa500]",
    indicator: "bg-[#ffa500]",
  },
  high: {
    label: "High Threat",
    accent: "text-[#ff4b4b]",
    indicator: "bg-[#ff4b4b]",
  },
};

const DEFAULT_VIDEO_SOURCE = droneFeed;

const demoCases = [
  {
    id: "case1",
    missionCode: "ORBIT-01",
    threatLevel: "low",
    peopleCount: 2,
    weaponCount: 0,
    threatScore: 25,
    summary:
      "Case ORBIT-01. Two individuals identified with calm posture. No weapons or suspects detected. Continue low-altitude observation.",
    videoSrc: DEFAULT_VIDEO_SOURCE,
    subjects: [],
    weaponNotes: "Thermal sweep clear. No metallic signatures detected.",
  },
  {
    id: "case2",
    missionCode: "ORBIT-02",
    threatLevel: "medium",
    peopleCount: 3,
    weaponCount: 1,
    threatScore: 58,
    summary:
      "Case ORBIT-02. Three individuals grouped near loading bay. One low-confidence sidearm outline. Maintain medium alert and await secondary confirmation.",
    subjects: [
      {
        id: "anonymous",
        name: "No matches",
        status: "Faces obscured",
        note: "Unable to match with any known database entries.",
        image: null,
      },
    ],
    videoSrc: DEFAULT_VIDEO_SOURCE,
    weaponNotes: "Possible holstered pistol detected at 42% confidence via silhouette analysis.",
  },
  {
    id: "case3",
    missionCode: "ORBIT-03",
    threatLevel: "high",
    peopleCount: 1,
    weaponCount: 1,
    threatScore: 92,
    summary:
      "Case ORBIT-03. Primary subject confirmed carrying compact SMG. Facial recognition matched Lena Ortiz, federal watchlist level crimson. Recommend immediate tactical negotiation.",
    subjects: [
      {
        id: "suspect-ortiz",
        name: "Lena Ortiz",
        status: "Suspect matched",
        note: "AWS Rekognition confidence 97%. Prior incident: covert arms trafficking.",
        image: null,
      },
    ],
    videoSrc: DEFAULT_VIDEO_SOURCE,
    weaponNotes: "Compact SMG visible with 96% confidence. Safety off, muzzle pointed toward loading dock.",
  },
];

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
  const [audioSrc, setAudioSrc] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [ttsError, setTtsError] = useState("");
  const [videoError, setVideoError] = useState(false);
  const audioRef = useRef(null);

  const activeCase = demoCases[activeIndex];
  const videoSource = activeCase.videoSrc ?? DEFAULT_VIDEO_SOURCE;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % demoCases.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      setSyncTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    setVideoError(false);
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      if (audioSrc) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  const threatMeta = useMemo(
    () => THREAT_META[activeCase.threatLevel],
    [activeCase.threatLevel]
  );

  const handleReadBriefing = async () => {
    const apiKey =
      (typeof process !== "undefined" && process.env?.OPENAI_API_KEY) ||
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENAI_API_KEY) ||
      "";

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
          input: activeCase.summary,
          voice: "alloy",
          format: "audio/mpeg",
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
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
              /* Playback must be user-initiated; controls remain visible */
            });
        }
      });
    } catch (error) {
      setTtsError(error instanceof Error ? error.message : "Unable to generate briefing.");
    } finally {
      setIsReading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0f] text-white">
      {/* Top Mission Header */}
      <header className="flex h-[10vh] items-center justify-between px-[4vw]">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">
            DRONE AI THREAT DASHBOARD
          </p>
          <h1 className="mt-[1vh] text-3xl font-bold">Mission {activeCase.missionCode}</h1>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold tracking-widest text-white/70">SYNC TIMER</p>
          <p className="mt-[0.5vh] text-2xl font-mono">{formatTimer(syncTimer)}</p>
          <p className="text-xs text-white/40">Auto-rotating demo feed</p>
        </div>
      </header>

      {/* Main Intelligence Panels */}
      <main className="flex h-[70vh] flex-1 gap-[2vw] px-[4vw] pb-[3vh]">
        {/* Drone Video Feed */}
        <Card className="flex flex-[2] flex-col bg-black/40 p-0">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-white/5 px-[2vw] py-[2vh]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Autonomous Drone Feed</p>
              <h2 className="text-2xl font-semibold">Thermal + Optical Composite</h2>
            </div>
            <Video className="h-[4vh] w-[4vh] text-white/60" />
          </CardHeader>
          <CardContent className="relative flex flex-1 items-center justify-center p-0">
            <video
              className="h-full w-full rounded-b-3xl object-cover"
              src={videoSource}
              onError={() => setVideoError(true)}
              controls
              muted
            />
            {videoError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-center">
                <WifiOff className="mb-4 h-[5vh] w-[5vh] text-white/40" />
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">NO SIGNAL DETECTED</p>
                <p className="mt-2 text-xs text-white/40">
                  Signal reacquisition pending. {/* WebRTC drone feed */}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threat Analytics */}
        <div className="flex flex-[1] flex-col gap-[2vh]">
          <Card className="bg-white/5">
            <CardHeader className="pb-[1vh]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.4em] text-white/60">Threat Level</span>
                <span className={`text-sm font-semibold ${threatMeta.accent}`}>
                  {threatMeta.label}
                </span>
              </div>
              <h3 className="text-3xl font-bold">Current Severity Window</h3>
            </CardHeader>
            <CardContent className="space-y-[2vh]">
              <Progress value={activeCase.threatScore} indicatorClassName={threatMeta.indicator} />
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Risk progression</span>
                <span>{activeCase.threatScore}%</span>
              </div>
              <div className="flex items-center gap-[1vw] rounded-2xl border border-white/10 bg-black/50 p-[2vh]">
                <AlertTriangle className={`${threatMeta.accent} h-[4vh] w-[4vh]`} />
                <p className="text-sm leading-relaxed text-white/80">
                  {activeCase.summary}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5">
            <CardHeader className="pb-[1vh]">
              <span className="text-xs uppercase tracking-[0.4em] text-white/60">Subjects</span>
              <h3 className="text-2xl font-semibold">Identified Entities</h3>
            </CardHeader>
            <CardContent className="space-y-[1.5vh]">
              {activeCase.subjects.length === 0 ? (
                <div className="flex h-[12vh] flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/40 text-sm text-white/50">
                  No subject detected
                </div>
              ) : (
                activeCase.subjects.map((subject) => {
                  const subjectImage = subject.image ?? null;

                  return (
                    <div
                      key={subject.id}
                      className="flex items-center gap-[1vw] rounded-2xl border border-white/10 bg-black/50 p-[2vh]"
                    >
                      <div className="h-[8vh] w-[8vh] overflow-hidden rounded-2xl bg-white/5">
                        {subjectImage ? (
                          <img
                            src={subjectImage}
                            alt={subject.name}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1f2933] via-[#111827] to-[#0a0a0f] text-[0.55rem] uppercase tracking-[0.3em] text-white/40">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="space-y-[0.5vh]">
                        <p className="text-lg font-semibold">{subject.name}</p>
                        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                          {subject.status}
                        </p>
                        <p className="text-sm text-white/70">{subject.note}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/5">
            <CardHeader className="pb-[1vh]">
              <span className="text-xs uppercase tracking-[0.4em] text-white/60">People & Weapons</span>
              <h3 className="text-2xl font-semibold">Live Telemetry Snapshot</h3>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-[1.5vh] text-sm">
              <div className="flex flex-col gap-[1vh] rounded-2xl border border-white/10 bg-black/50 p-[2vh]">
                <div className="flex items-center gap-[0.5vw] text-white/70">
                  <Users className="h-[3vh] w-[3vh]" />
                  <span className="uppercase tracking-[0.2em]">People</span>
                </div>
                <p className="text-4xl font-bold">{activeCase.peopleCount}</p>
                <p className="text-xs text-white/50">Human silhouettes tracked in frame.</p>
              </div>
              <div className="flex flex-col gap-[1vh] rounded-2xl border border-white/10 bg-black/50 p-[2vh]">
                <div className="flex items-center gap-[0.5vw] text-white/70">
                  <Target className="h-[3vh] w-[3vh]" />
                  <span className="uppercase tracking-[0.2em]">Weapons</span>
                </div>
                <p className="text-4xl font-bold">{activeCase.weaponCount}</p>
                <p className="text-xs text-white/50">{activeCase.weaponNotes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Bottom Control Deck + TTS */}
      <footer className="flex h-[20vh] flex-col gap-[2vh] px-[4vw] pb-[3vh]">
        <div className="flex flex-1 items-center justify-between gap-[2vw]">
          <div className="flex flex-wrap gap-[1vw]">
            <Button className="min-w-[12vw] bg-white/10 text-white shadow-[0_0_20px_rgba(22,241,149,0.25)] transition hover:shadow-[0_0_35px_rgba(22,241,149,0.45)]">
              <Video className="mr-[0.5vw] h-[3vh] w-[3vh]" /> Drone View
            </Button>
            <Button className="min-w-[12vw] bg-white/10 text-white shadow-[0_0_20px_rgba(255,165,0,0.25)] transition hover:shadow-[0_0_35px_rgba(255,165,0,0.45)]">
              <Map className="mr-[0.5vw] h-[3vh] w-[3vh]" /> Map
            </Button>
            <Button className="min-w-[12vw] bg-white/10 text-white shadow-[0_0_20px_rgba(22,241,149,0.25)] transition hover:shadow-[0_0_35px_rgba(22,241,149,0.45)]">
              <ScrollText className="mr-[0.5vw] h-[3vh] w-[3vh]" /> AI Summary
            </Button>
            <Button
              onClick={handleReadBriefing}
              disabled={isReading}
              className="min-w-[13vw] bg-gradient-to-r from-[#16f195] via-[#ffa500] to-[#ff4b4b] text-black shadow-[0_0_25px_rgba(255,75,75,0.45)] transition hover:shadow-[0_0_40px_rgba(255,75,75,0.65)] disabled:opacity-60"
            >
              <Volume2 className={`mr-[0.5vw] h-[3vh] w-[3vh] ${isReading ? "animate-pulse" : ""}`} />
              Read Briefing
            </Button>
          </div>
          <div className="flex flex-wrap gap-[1vw]">
            <Button className="min-w-[13vw] bg-white/10 text-white shadow-[0_0_20px_rgba(22,241,149,0.25)] transition hover:shadow-[0_0_35px_rgba(22,241,149,0.45)]">
              <Radio className="mr-[0.5vw] h-[3vh] w-[3vh]" /> Drone Negotiation
            </Button>
            <Button className="min-w-[13vw] bg-white/10 text-white shadow-[0_0_20px_rgba(255,165,0,0.25)] transition hover:shadow-[0_0_35px_rgba(255,165,0,0.45)]">
              <Mic className="mr-[0.5vw] h-[3vh] w-[3vh]" /> Microphone
            </Button>
          </div>
        </div>
        <Card className="flex flex-1 items-center justify-between bg-black/40 px-[3vw] py-[2vh]">
          <div className="max-w-[45vw] space-y-[1vh]">
            <span className="text-xs uppercase tracking-[0.4em] text-white/60">AI Briefing Audio</span>
            <p className="text-sm text-white/70">{activeCase.summary}</p>
            {ttsError && <p className="text-xs text-red-400">{ttsError}</p>}
          </div>
          <div className="flex w-[28vw] flex-col gap-[1vh]">
            <audio ref={audioRef} controls src={audioSrc} className="w-full rounded-2xl bg-black/60 px-[1vw] py-[1vh]" />
            <p className="text-[0.65rem] text-white/40">
              {/* WebRTC drone feed integration placeholder */}
              {/* TODO: replace mocked video pipeline with secure WebRTC stream */}
            </p>
            <p className="text-[0.65rem] text-white/40">
              {/* YOLOv8 weapon detection integration placeholder */}
              {/* TODO: connect detection overlay via YOLOv8 inference endpoint */}
            </p>
            <p className="text-[0.65rem] text-white/40">
              {/* AWS Rekognition face match integration placeholder */}
              {/* TODO: connect to Rekognition subject-matching API */}
            </p>
            <p className="text-[0.65rem] text-white/40">
              {/* MySQL logging integration placeholder */}
              {/* TODO: persist case snapshots and operator actions to mission database */}
            </p>
          </div>
        </Card>
      </footer>
    </div>
  );
};

export default ThreatDashboard;
