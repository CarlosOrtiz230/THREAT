import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Circle,
  Cpu,
  Map,
  Mic,
  Orbit,
  Radio,
  ScrollText,
  Video,
  Volume2,
  Wifi,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const BASE_WIDTH = 2880;
const BASE_HEIGHT = 1280;

const THREAT_GRADIENTS = {
  high: "from-red-500/90 via-red-600/90 to-red-700/80",
  medium: "from-amber-400/90 via-orange-500/90 to-amber-500/80",
  low: "from-emerald-400/90 via-emerald-500/90 to-emerald-600/80",
} as const;

const THREAT_LABELS = {
  high: "High Threat",
  medium: "Elevated Threat",
  low: "Stable Threat",
} as const;

type ThreatLevel = keyof typeof THREAT_GRADIENTS;
type ActiveView = "drone" | "map" | "summary" | "tts";

const SUBJECTS = [
  {
    id: "Alpha-01",
    status: "Aggressive",
    confidence: 0.92,
    image:
      "linear-gradient(135deg, rgba(239,68,68,0.45), rgba(15,23,42,0.85))",
  },
  {
    id: "Bravo-09",
    status: "Armed",
    confidence: 0.87,
    image:
      "linear-gradient(135deg, rgba(59,130,246,0.45), rgba(15,23,42,0.85))",
  },
  {
    id: "Charlie-12",
    status: "Fleeing",
    confidence: 0.81,
    image:
      "linear-gradient(135deg, rgba(249,115,22,0.45), rgba(15,23,42,0.85))",
  },
  {
    id: "Delta-04",
    status: "Unarmed",
    confidence: 0.74,
    image:
      "linear-gradient(135deg, rgba(34,197,94,0.45), rgba(15,23,42,0.85))",
  },
  {
    id: "Echo-07",
    status: "Hiding",
    confidence: 0.68,
    image:
      "linear-gradient(135deg, rgba(147,51,234,0.45), rgba(15,23,42,0.85))",
  },
  {
    id: "Foxtrot-03",
    status: "Armed",
    confidence: 0.83,
    image:
      "linear-gradient(135deg, rgba(255,255,255,0.35), rgba(15,23,42,0.85))",
  },
];

const VIEW_CONTENT: Record<ActiveView, { title: string; description: string }> = {
  drone: {
    title: "Autonomous Drone Feed",
    description:
      "Thermal and optical layers synced. Tracking 6 subjects, 2 flagged anomalies.",
  },
  map: {
    title: "Mission Map Overlay",
    description:
      "LIDAR sweep plotted against city grid. Evacuation radius established.",
  },
  summary: {
    title: "AI Tactical Summary",
    description:
      "Negotiation likelihood: 63%. Recommend containment perimeter and drone hail.",
  },
  tts: {
    title: "Active Text-to-Speech Channel",
    description:
      "Ready to broadcast pre-approved de-escalation script to on-site subjects.",
  },
};

const METRICS = {
  people: 6,
  weapons: 2,
  drones: 3,
};

const computeScale = () => {
  if (typeof window === "undefined") {
    return 1;
  }
  return Math.min(window.innerWidth / BASE_WIDTH, window.innerHeight / BASE_HEIGHT);
};

function App() {
  const [activeView, setActiveView] = useState<ActiveView>("drone");
  const [scale, setScale] = useState<number>(() => computeScale());
  const [threatIndex, setThreatIndex] = useState(0);
  const threatLevel = useMemo<ThreatLevel>(
    () => ["high", "medium", "low"][threatIndex] as ThreatLevel,
    [threatIndex]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleResize = () => {
      setScale(computeScale());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      setThreatIndex((previous) => (previous + 1) % 3);
    }, 10000);

    return () => window.clearInterval(interval);
  }, []);

  const viewContent = VIEW_CONTENT[activeView];

  return (
    <div className="flex min-h-screen min-w-full items-center justify-center bg-[#050608] text-foreground">
      <div
        className="relative origin-top-left"
        style={{
          transform: `scale(${scale})`,
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
        }}
      >
        <div className="flex h-full w-full flex-col gap-8 p-10">
          <header className="flex h-[160px] items-center justify-between rounded-[40px] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-16 shadow-2xl shadow-black/40">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400">
                Tactical Human-Response Evaluation and Assessment Tool
              </p>
              <h1 className="mt-3 text-5xl font-black tracking-tight text-white">
                Drone AI Threat Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-6 text-right">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Operation Code
                </p>
                <p className="text-2xl font-semibold text-white">T.H.R.E.A.T.</p>
              </div>
              <div className="h-20 w-[2px] bg-white/10" />
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                  Last Sync
                </p>
                <p className="text-2xl font-semibold text-emerald-400">00:14:32</p>
              </div>
            </div>
          </header>

          <main className="flex flex-1 gap-8">
            <section className="relative h-[800px] w-[1920px] overflow-hidden rounded-[48px] border border-white/10 bg-black/70">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at 20% 20%, rgba(148,163,184,0.2), transparent 55%), radial-gradient(circle at 80% 35%, rgba(59,130,246,0.25), transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.8), rgba(2,6,23,0.95))",
                }}
              />

              <div className="absolute inset-0 flex flex-col justify-between p-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 rounded-full bg-black/60 px-6 py-3 text-sm uppercase tracking-[0.35em] text-red-400">
                    <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-red-500" />
                    Recording
                  </div>
                  <div className="flex items-center gap-4 text-slate-200">
                    <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm">
                      <Wifi className="h-4 w-4 text-emerald-400" />
                      <span>Secure Link</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm">
                      <Radio className="h-4 w-4 text-sky-400" />
                      <span>UAV-02</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      {viewContent.title}
                    </p>
                    <h2 className="text-4xl font-bold text-white">
                      {viewContent.description}
                    </h2>
                    <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                          People Detected
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {METRICS.people}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                          Weapons Flagged
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {METRICS.weapons}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                          Support Drones
                        </p>
                        <p className="mt-2 text-3xl font-semibold text-white">
                          {METRICS.drones}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end gap-6">
                    <div className="flex items-center gap-4 self-end rounded-3xl bg-black/60 px-6 py-4">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                          Threat Level
                        </p>
                        <p className="text-3xl font-bold text-white">
                          {THREAT_LABELS[threatLevel]}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
                      <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                        <div className="mb-2 flex items-center gap-3 text-sky-400">
                          <Video className="h-5 w-5" />
                          <span className="text-xs uppercase tracking-[0.35em]">
                            Vision Model
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          YOLOv8 + AWS Rekognition
                        </p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-black/50 p-6">
                        <div className="mb-2 flex items-center gap-3 text-emerald-400">
                          <Cpu className="h-5 w-5" />
                          <span className="text-xs uppercase tracking-[0.35em]">
                            Decision Engine
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                          OpenAI Tactical Reasoner
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-10 flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm uppercase tracking-[0.35em] text-slate-200">
                  <Circle className="h-3 w-3 text-emerald-400" />
                  Stable Link
                </div>
                <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm uppercase tracking-[0.35em] text-slate-200">
                  <Orbit className="h-3 w-3 text-sky-400" />
                  Alt 142m
                </div>
              </div>
            </section>

            <section className="flex h-[800px] w-[960px] flex-col gap-6">
              <Card className="h-[120px] overflow-hidden border-white/20 bg-black/70 p-0">
                <CardContent className="flex h-full items-center justify-between px-10 py-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                      Threat Severity Index
                    </p>
                    <h3 className="mt-3 text-3xl font-bold text-white">
                      {THREAT_LABELS[threatLevel]}
                    </h3>
                  </div>
                  <div className="h-3 w-[520px] overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full w-full animate-pulse-slow bg-gradient-to-r ${THREAT_GRADIENTS[threatLevel]}`}
                    />
                  </div>
                  <span className="text-sm uppercase tracking-[0.35em] text-slate-400">
                    {threatLevel.toUpperCase()}
                  </span>
                </CardContent>
              </Card>

              <Card className="h-[540px] border-white/20 bg-black/70">
                <CardHeader>
                  <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                    Subjects of Interest
                  </p>
                  <h3 className="text-2xl font-semibold text-white">
                    Visual Confirmation Pending Authentication
                  </h3>
                </CardHeader>
                <CardContent className="mt-6 grid grid-cols-3 gap-6">
                  {SUBJECTS.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/60 p-4"
                    >
                      <div
                        className="h-40 w-full rounded-2xl bg-cover bg-center"
                        style={{ background: subject.image }}
                      />
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                          {subject.id}
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {subject.status}
                        </p>
                        <p className="text-xs text-slate-400">
                          Confidence {Math.round(subject.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="h-[140px] border-white/20 bg-black/70">
                <CardContent className="flex h-full items-center justify-between px-10">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Total People
                    </p>
                    <p className="text-4xl font-semibold text-white">
                      {METRICS.people}
                    </p>
                  </div>
                  <div className="h-16 w-px bg-white/10" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Weapons Detected
                    </p>
                    <p className="text-4xl font-semibold text-white">
                      {METRICS.weapons}
                    </p>
                  </div>
                  <div className="h-16 w-px bg-white/10" />
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
                      Drone Assets
                    </p>
                    <p className="text-4xl font-semibold text-white">
                      {METRICS.drones}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </main>

          <footer className="flex h-[320px] gap-8">
            <div className="grid h-full w-[1920px] grid-cols-4 gap-6">
              <Button
                size="xl"
                variant={activeView === "drone" ? "accent" : "default"}
                className="flex flex-col items-start gap-6 rounded-[36px] px-10 text-left"
                onClick={() => setActiveView("drone")}
              >
                <div className="flex items-center gap-4 text-emerald-300">
                  <Video className="h-10 w-10" />
                  <span className="text-sm uppercase tracking-[0.35em]">
                    Drone View
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  Multispectral feed & telemetry
                </p>
              </Button>
              <Button
                size="xl"
                variant={activeView === "map" ? "accent" : "default"}
                className="flex flex-col items-start gap-6 rounded-[36px] px-10 text-left"
                onClick={() => setActiveView("map")}
              >
                <div className="flex items-center gap-4 text-sky-300">
                  <Map className="h-10 w-10" />
                  <span className="text-sm uppercase tracking-[0.35em]">
                    Map
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  Tactical overlays & safe corridors
                </p>
              </Button>
              <Button
                size="xl"
                variant={activeView === "summary" ? "accent" : "default"}
                className="flex flex-col items-start gap-6 rounded-[36px] px-10 text-left"
                onClick={() => setActiveView("summary")}
              >
                <div className="flex items-center gap-4 text-amber-300">
                  <ScrollText className="h-10 w-10" />
                  <span className="text-sm uppercase tracking-[0.35em]">
                    AI Summary
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  Generated mission intelligence
                </p>
              </Button>
              <Button
                size="xl"
                variant={activeView === "tts" ? "accent" : "default"}
                className="flex flex-col items-start gap-6 rounded-[36px] px-10 text-left"
                onClick={() => setActiveView("tts")}
              >
                <div className="flex items-center gap-4 text-purple-300">
                  <Volume2 className="h-10 w-10" />
                  <span className="text-sm uppercase tracking-[0.35em]">
                    Text to Speech
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  Deploy real-time voice directives
                </p>
              </Button>
            </div>
            <div className="grid h-full flex-1 grid-cols-2 gap-6">
              <Button
                size="xl"
                variant="destructive"
                className="flex flex-col items-start gap-6 rounded-[36px] px-10 text-left"
              >
                <div className="flex items-center gap-4 text-red-200">
                  <Radio className="h-10 w-10" />
                  <span className="text-sm uppercase tracking-[0.35em]">
                    Drone Negotiation
                  </span>
                </div>
                <p className="text-3xl font-bold text-white">
                  Initiate adaptive de-escalation script
                </p>
              </Button>
              <Button size="icon" variant="outline" className="rounded-[36px] text-white">
                <Mic className="h-16 w-16" />
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
