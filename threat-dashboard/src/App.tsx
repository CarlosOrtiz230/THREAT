import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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

const THREAT_LABELS = {
  low: "Low Threat",
  medium: "Medium Threat",
  high: "High Threat",
} as const;

const THREAT_COLORS = {
  low: "bg-[#16f195]",
  medium: "bg-[#ffa500]",
  high: "bg-[#ff4b4b]",
} as const;

type ThreatLevel = keyof typeof THREAT_LABELS;
type ActiveView = "drone" | "map" | "summary" | "tts";

type Subject = {
  id: string;
  name: string;
  image: string;
};

type ThreatCase = {
  threatLevel: ThreatLevel;
  people: number;
  weapons: number;
  faces: Subject[];
};

const SUBJECT_LIBRARY: Subject[] = [
  {
    id: "alpha",
    name: "Avery Holt",
    image:
      "linear-gradient(135deg, rgba(22,241,149,0.4), rgba(15,23,42,0.9))",
  },
  {
    id: "bravo",
    name: "Micah Voss",
    image:
      "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(15,23,42,0.9))",
  },
  {
    id: "charlie",
    name: "Noah Reyes",
    image:
      "linear-gradient(135deg, rgba(255,165,0,0.4), rgba(15,23,42,0.9))",
  },
  {
    id: "delta",
    name: "Rowan Ibarra",
    image:
      "linear-gradient(135deg, rgba(255,75,75,0.4), rgba(15,23,42,0.9))",
  },
  {
    id: "echo",
    name: "Sloane Park",
    image:
      "linear-gradient(135deg, rgba(147,51,234,0.45), rgba(15,23,42,0.9))",
  },
  {
    id: "foxtrot",
    name: "Kai Mercer",
    image:
      "linear-gradient(135deg, rgba(14,165,233,0.45), rgba(15,23,42,0.9))",
  },
];

const THREAT_CASES: ThreatCase[] = [
  {
    threatLevel: "low",
    people: 5,
    weapons: 0,
    faces: SUBJECT_LIBRARY.slice(0, 4),
  },
  {
    threatLevel: "medium",
    people: 7,
    weapons: 1,
    faces: SUBJECT_LIBRARY.slice(1, 5),
  },
  {
    threatLevel: "high",
    people: 9,
    weapons: 3,
    faces: SUBJECT_LIBRARY.slice(2, 6),
  },
];

const formatElapsed = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remaining = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${remaining}`;
};

function DroneViewSummary({
  people,
  weapons,
}: {
  people: number;
  weapons: number;
}) {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
        Autonomous Drone Feed
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Live multispectral capture stabilized. Thermal overlay active.
      </h2>
      <div className="grid grid-cols-3 gap-4 text-left text-sm text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            People tracked
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{people}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Weapons flagged
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{weapons}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Signal quality
          </p>
          <p className="mt-2 text-3xl font-bold text-white">98%</p>
        </div>
      </div>
    </div>
  );
}

function MapViewSummary() {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
        Mission Map Overlay
      </p>
      <h2 className="text-3xl font-semibold text-white">
        City grid locked. Evacuation corridors highlighted in teal.
      </h2>
      <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Safe radius
          </p>
          <p className="mt-2 text-3xl font-bold text-white">320 m</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/50 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            Extraction points
          </p>
          <p className="mt-2 text-3xl font-bold text-white">3 Active</p>
        </div>
      </div>
    </div>
  );
}

function SummaryView() {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
        AI Tactical Summary
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Negotiation probability holding at 62%. Recommend containment perimeter.
      </h2>
      <ul className="space-y-3 text-sm text-slate-200">
        <li>• Crowd calming broadcast queued.</li>
        <li>• Drone 02 positioned for overwatch.</li>
        <li>• Local authorities on standby channel 4.</li>
      </ul>
    </div>
  );
}

function TextToSpeechView() {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.35em] text-slate-300">
        Text to Speech Control
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Ready to transmit pre-approved de-escalation script to subjects.
      </h2>
      <div className="rounded-2xl border border-dashed border-white/20 bg-black/40 p-6 text-sm text-slate-200">
        <p>“This is an automated drone. Please remain calm and await instructions.”</p>
      </div>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState<ActiveView>("drone");
  const [caseIndex, setCaseIndex] = useState(0);
  const [threatLevel, setThreatLevel] = useState<ThreatLevel>(
    THREAT_CASES[0].threatLevel,
  );
  const [peopleCount, setPeopleCount] = useState(THREAT_CASES[0].people);
  const [weaponsDetected, setWeaponsDetected] = useState(
    THREAT_CASES[0].weapons,
  );
  const [faces, setFaces] = useState<Subject[]>(THREAT_CASES[0].faces);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const interval = window.setInterval(() => {
      setCaseIndex((prev) => (prev + 1) % THREAT_CASES.length);
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const current = THREAT_CASES[caseIndex];
    setThreatLevel(current.threatLevel);
    setPeopleCount(current.people);
    setWeaponsDetected(current.weapons);
    setFaces(current.faces);
    setLastSyncSeconds(0);
  }, [caseIndex]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timer = window.setInterval(() => {
      setLastSyncSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const threatColor = useMemo(() => THREAT_COLORS[threatLevel], [threatLevel]);

  let viewContent: JSX.Element;
  switch (activeView) {
    case "map":
      viewContent = <MapViewSummary />;
      break;
    case "summary":
      viewContent = <SummaryView />;
      break;
    case "tts":
      viewContent = <TextToSpeechView />;
      break;
    default:
      viewContent = (
        <DroneViewSummary people={peopleCount} weapons={weaponsDetected} />
      );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#05060b] text-white">
      <header className="flex h-[10vh] items-center justify-between border-b border-white/10 bg-[#0a0a0f] px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">
            Drone AI Threat Dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-wide text-white">
            DRONE AI THREAT DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-8 text-right">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Operation Code
            </p>
            <p className="text-xl font-semibold text-white">T.H.R.E.A.T.</p>
          </div>
          <div className="h-12 w-px bg-white/10" />
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              Last Sync
            </p>
            <p className="text-xl font-semibold text-[#16f195]">
              {formatElapsed(lastSyncSeconds)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex h-[65vh] gap-6 px-10 py-6">
        <section className="flex flex-[2] items-center justify-center">
          <div className="relative aspect-video w-full max-h-full overflow-hidden rounded-3xl border border-white/10 bg-black/60">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at 20% 20%, rgba(148,163,184,0.2), transparent 55%), radial-gradient(circle at 80% 35%, rgba(59,130,246,0.25), transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.85), rgba(2,6,23,0.95))",
              }}
            />
            <div className="absolute left-6 top-6 flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-red-400">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-[0.35em] text-slate-200">
                <Wifi className="h-4 w-4 text-[#16f195]" /> Secure Link
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col justify-center gap-12 px-12">
              {viewContent}
            </div>
            <div className="absolute bottom-6 right-6 flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-200">
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2">
                <Circle className="h-3 w-3 text-[#16f195]" /> Stable
              </div>
              <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2">
                <Radio className="h-3 w-3 text-sky-400" /> Alt 142m
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-[1] flex-col gap-6">
          <div className="flex h-[12vh] items-center justify-between rounded-3xl border border-white/10 bg-black/70 px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Threat Severity
              </p>
              <h2 className="text-2xl font-semibold text-white">
                {THREAT_LABELS[threatLevel]}
              </h2>
            </div>
            <div className="flex h-3 w-1/2 overflow-hidden rounded-full bg-white/10">
              <div className={`h-full w-full ${threatColor}`} />
            </div>
            <AlertTriangle className="h-8 w-8 text-[#ff4b4b]" />
          </div>

          <div className="flex flex-1 flex-col rounded-3xl border border-white/10 bg-black/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Subjects of Interest
                </p>
                <h3 className="text-xl font-semibold text-white">
                  Visual confirmation required
                </h3>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 gap-4">
              {faces.map((subject) => (
                <div
                  key={subject.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/60"
                >
                  <div
                    className="h-32 w-full bg-cover bg-center"
                    style={{ background: subject.image }}
                  />
                  <div className="px-4 py-3">
                    <p className="text-sm font-semibold text-white">
                      {subject.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex h-[10vh] items-center justify-between rounded-3xl border border-white/10 bg-black/70 px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                People Detected
              </p>
              <p className="text-3xl font-semibold text-white">{peopleCount}</p>
            </div>
            <div className="h-14 w-px bg-white/10" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                Weapons Detected
              </p>
              <p className="text-3xl font-semibold text-white">
                {weaponsDetected}
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex h-[15vh] items-stretch gap-6 px-10 pb-10">
        <div className="flex flex-[2] items-stretch gap-4">
          <Button
            size="xl"
            variant={activeView === "drone" ? "accent" : "default"}
            className="flex-1 rounded-2xl border border-white/10 bg-black/70 text-left"
            onClick={() => setActiveView("drone")}
          >
            <div className="flex h-full flex-col justify-center gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-[#16f195]">
                <Video className="h-4 w-4" /> Drone View
              </span>
              <p className="text-lg font-semibold text-white">
                Live drone perspective
              </p>
            </div>
          </Button>
          <Button
            size="xl"
            variant={activeView === "map" ? "accent" : "default"}
            className="flex-1 rounded-2xl border border-white/10 bg-black/70 text-left"
            onClick={() => setActiveView("map")}
          >
            <div className="flex h-full flex-col justify-center gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-sky-300">
                <Map className="h-4 w-4" /> Map
              </span>
              <p className="text-lg font-semibold text-white">
                Tactical overlays
              </p>
            </div>
          </Button>
          <Button
            size="xl"
            variant={activeView === "summary" ? "accent" : "default"}
            className="flex-1 rounded-2xl border border-white/10 bg-black/70 text-left"
            onClick={() => setActiveView("summary")}
          >
            <div className="flex h-full flex-col justify-center gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-amber-300">
                <ScrollText className="h-4 w-4" /> AI Summary
              </span>
              <p className="text-lg font-semibold text-white">
                Situation brief
              </p>
            </div>
          </Button>
          <Button
            size="xl"
            variant={activeView === "tts" ? "accent" : "default"}
            className="flex-1 rounded-2xl border border-white/10 bg-black/70 text-left"
            onClick={() => setActiveView("tts")}
          >
            <div className="flex h-full flex-col justify-center gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-purple-300">
                <Volume2 className="h-4 w-4" /> Text to Speech
              </span>
              <p className="text-lg font-semibold text-white">
                Command channel
              </p>
            </div>
          </Button>
        </div>
        <div className="flex flex-1 items-stretch gap-4">
          <Button
            size="xl"
            variant="destructive"
            className="flex-1 rounded-2xl border border-red-500/40 text-left"
          >
            <div className="flex h-full flex-col justify-center gap-2">
              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-red-200">
                <Radio className="h-4 w-4" /> Drone Negotiation
              </span>
              <p className="text-lg font-semibold text-white">
                Initiate verbal protocol
              </p>
            </div>
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="aspect-square rounded-2xl border border-white/20"
          >
            <Mic className="h-6 w-6" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default App;
