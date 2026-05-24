// ══════════════════════════════════════════════════════════════════════════════
//  FOR HER OS — Private Desktop Environment  |  with Mascots: Ash & Ivory
// ══════════════════════════════════════════════════════════════════════════════
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BookOpen, CalendarDays, ChevronLeft, ChevronRight, Check,
  Feather, Film, Gamepad2, GitCommitVertical, Heart, Images,
  Info, Mail, MapPin, Music, RefreshCw, StickyNote, TerminalSquare,
} from "lucide-react";

export const Route = createFileRoute("/_inside/home")({
  head: () => ({ meta: [{ title: "For Her OS" }] }),
  component: DesktopOS,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Win {
  id: string; app: AppId;
  x: number; y: number; w: number; h: number;
  z: number; minimized: boolean; maximized: boolean;
}

// ─── App Manifest ─────────────────────────────────────────────────────────────
const APPS = [
  { id: "gallery",  label: "Gallery",   Icon: Images,            title: "Gallery — Frames of You",    w: 820, h: 570 },
  { id: "cinema",   label: "Cinema",    Icon: Film,              title: "Cinema — Living Stills",     w: 880, h: 540 },
  { id: "letter",   label: "Letter",    Icon: Mail,              title: "Letter — For You",           w: 640, h: 660 },
  { id: "timeline", label: "Timeline",  Icon: GitCommitVertical, title: "Timeline — Marks in Time",   w: 720, h: 580 },
  { id: "playlist", label: "Playlist",  Icon: Music,             title: "Playlist — Songs for You",   w: 500, h: 560 },
  { id: "dreams",   label: "Dreams",    Icon: Heart,             title: "Dreams — What We'll Do",     w: 520, h: 580 },
  { id: "about",    label: "About Her", Icon: Info,              title: "About Her — System Info",    w: 480, h: 500 },
  { id: "terminal", label: "Terminal",  Icon: TerminalSquare,    title: "Terminal — love.sh",         w: 620, h: 390 },
  { id: "calendar", label: "Calendar",  Icon: CalendarDays,      title: "Calendar — Our Dates",       w: 480, h: 520 },
  { id: "journal",  label: "Journal",   Icon: BookOpen,          title: "Journal — Private Entries",  w: 660, h: 590 },
  { id: "poems",    label: "Poems",     Icon: Feather,           title: "Poems — Words for You",      w: 540, h: 560 },
  { id: "notes",    label: "Notes",     Icon: StickyNote,        title: "Notes — Reasons",            w: 400, h: 500 },
  { id: "game",     label: "Memory",    Icon: Gamepad2,          title: "Memory — Match the Cards",   w: 540, h: 500 },
  { id: "map",      label: "Our World", Icon: MapPin,            title: "Our World — Places to Go",   w: 800, h: 540 },
] as const;

type AppId = typeof APPS[number]["id"];

// ─── Window Manager Hook ──────────────────────────────────────────────────────
function useWM() {
  const [wins, setWins] = useState<Win[]>([]);
  const z = useRef(100);
  const open = useCallback((app: AppId) => {
    setWins(prev => {
      const ex = prev.find(w => w.app === app);
      if (ex) return prev.map(w => w.app === app ? { ...w, minimized: false, z: ++z.current } : w);
      const meta = APPS.find(a => a.id === app)!;
      const vw = window.innerWidth, vh = window.innerHeight;
      return [...prev, {
        id: `${app}-${Date.now()}`, app,
        x: Math.max(60, Math.min((vw - meta.w) / 2 + (Math.random() * 60 - 30), vw - meta.w - 20)),
        y: Math.max(40, Math.min((vh - meta.h) / 2 + (Math.random() * 50 - 25), vh - meta.h - 80)),
        w: meta.w, h: meta.h, z: ++z.current, minimized: false, maximized: false,
      }];
    });
  }, []);
  const close    = useCallback((id: string) => setWins(p => p.filter(w => w.id !== id)), []);
  const focus    = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, z: ++z.current, minimized: false } : w)), []);
  const minimize = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)), []);
  const maximize = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w)), []);
  const move     = useCallback((id: string, x: number, y: number) => setWins(p => p.map(w => w.id === id ? { ...w, x, y } : w)), []);
  return { wins, open, close, focus, minimize, maximize, move };
}

// ─── Window Chrome ────────────────────────────────────────────────────────────
function OSWindow({ win, onClose, onMinimize, onMaximize, onFocus, onMove, children }: {
  win: Win; onClose(): void; onMinimize(): void; onMaximize(): void;
  onFocus(): void; onMove(x: number, y: number): void; children: React.ReactNode;
}) {
  const handleDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault(); onFocus();
    const ox = e.clientX - win.x, oy = e.clientY - win.y;
    const mm = (ev: MouseEvent) => onMove(ev.clientX - ox, Math.max(32, ev.clientY - oy));
    const mu = () => { document.removeEventListener("mousemove", mm); document.removeEventListener("mouseup", mu); };
    document.addEventListener("mousemove", mm);
    document.addEventListener("mouseup", mu);
  };
  if (win.minimized) return null;
  const boxStyle: React.CSSProperties = win.maximized
    ? { position: "fixed", left: 0, top: 32, width: "100vw", height: "calc(100vh - 32px)", zIndex: win.z }
    : { position: "fixed", left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };
  return (
    <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...boxStyle, boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)" }}
      className="flex flex-col rounded-xl overflow-hidden" onClick={onFocus}>
      <div onMouseDown={handleDrag}
        className="flex items-center gap-3 px-4 h-10 bg-[#1c1c1e] border-b border-white/[0.07] select-none shrink-0 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-1.5">
          <button onClick={onClose}    className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-125 transition-all" title="Close" />
          <button onClick={onMinimize} className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-125 transition-all" title="Minimize" />
          <button onClick={onMaximize} className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-125 transition-all" title="Maximize" />
        </div>
        <span className="flex-1 text-center text-[10px] text-[#555] font-mono uppercase tracking-[0.35em] truncate select-none">
          {APPS.find(a => a.id === win.app)?.title}
        </span>
        <div className="w-14" />
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  APP COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Gallery ──────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: "/media/photos/p1.jpg", caption: "Neon hush",      detail: "Late night, soft glow." },
  { src: "/media/photos/p2.jpg", caption: "Slow afternoon", detail: "Nowhere to be." },
  { src: "/media/photos/p3.jpg", caption: "Stay close",     detail: "Don't go." },
  { src: "/media/photos/p4.jpg", caption: "That smile",     detail: "The one that ruins me." },
  { src: "/media/photos/p5.jpg", caption: "Soft world",     detail: "You made it soft." },
  { src: "/media/photos/p6.jpg", caption: "Sunlit",         detail: "Golden everything." },
];
function GalleryApp() {
  const [view, setView] = useState<number | null>(null);
  return (
    <div className="h-full bg-[#111] overflow-hidden flex flex-col relative">
      <div className="flex-1 overflow-auto p-5 grid grid-cols-3 gap-2 content-start">
        {PHOTOS.map((p, i) => (
          <button key={i} onClick={() => setView(i)} className="group relative aspect-square overflow-hidden rounded-md">
            <img src={p.src} alt={p.caption} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-left">
              <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-xs font-display italic text-white/90">{p.caption}</div>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {view !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/96 flex items-center justify-center" onClick={() => setView(null)}>
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-2"
              onClick={e => { e.stopPropagation(); setView(v => (v === 0 ? PHOTOS.length - 1 : v! - 1)); }}>
              <ChevronLeft size={24} />
            </button>
            <motion.div key={view} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center" onClick={e => e.stopPropagation()}>
              <img src={PHOTOS[view].src} alt="" className="max-h-[75vh] max-w-[80vw] object-contain mx-auto" />
              <div className="mt-4 space-y-1">
                <div className="font-display italic text-xl text-white/90">{PHOTOS[view].caption}</div>
                <div className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">{PHOTOS[view].detail}</div>
              </div>
            </motion.div>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/80 transition-colors p-2"
              onClick={e => { e.stopPropagation(); setView(v => (v === PHOTOS.length - 1 ? 0 : v! + 1)); }}>
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-6 flex gap-1.5">
              {PHOTOS.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setView(i); }}
                  className={`h-1.5 rounded-full transition-all ${i === view ? "bg-white/80 w-4" : "bg-white/25 w-1.5"}`} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Cinema ───────────────────────────────────────────────────────────────────
const VIDEOS = [
  { src: "/media/videos/v1.mp4", title: "Moment I",   note: "Caught in motion." },
  { src: "/media/videos/v2.mp4", title: "Moment II",  note: "The way you move." },
  { src: "/media/videos/v3.mp4", title: "Moment III", note: "Soft, unrehearsed." },
  { src: "/media/videos/v4.mp4", title: "Moment IV",  note: "Replay forever." },
];
function CinemaApp() {
  const [cur, setCur] = useState(0);
  return (
    <div className="h-full bg-[#0a0a0a] flex">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video key={VIDEOS[cur].src} src={VIDEOS[cur].src} controls autoPlay playsInline
            className="max-h-full max-w-full object-contain" />
        </div>
        <div className="px-5 py-3 border-t border-white/[0.06]">
          <div className="font-display italic text-lg text-[var(--ash)]">{VIDEOS[cur].title}</div>
          <div className="text-[10px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.3em]">{VIDEOS[cur].note}</div>
        </div>
      </div>
      <div className="w-44 border-l border-white/[0.06] overflow-auto shrink-0">
        {VIDEOS.map((v, i) => (
          <button key={i} onClick={() => setCur(i)}
            className={`w-full text-left p-4 border-b border-white/[0.04] transition-colors ${i === cur ? "bg-white/[0.07]" : "hover:bg-white/[0.03]"}`}>
            <div className="text-[10px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.3em] mb-1">{String(i + 1).padStart(2, "0")}</div>
            <div className="text-sm font-display italic text-[var(--ash)]">{v.title}</div>
            <div className="text-[10px] font-mono text-[var(--ash-deep)]/60 mt-0.5">{v.note}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Letter ───────────────────────────────────────────────────────────────────
const PARAS = [
  "I'm not a poet. I never was. But every time I think of you, language starts to behave like one — softer, slower, careful with its weight.",
  "You like black. You like ash. Two colors most people overlook because they think there's nothing inside them. But I've seen what lives there — depth, warmth, the kind of quiet that holds you instead of leaving you alone.",
  "That's you. Quiet, but never empty. Soft, but never small. Still, but never still enough that I stop noticing.",
  "I built this little corner because flowers wilt and chocolates run out. But pixels — pixels can stay exactly where I put them, holding the shape of how I feel, unchanging while everything else moves.",
  "This whole archive is just one long way of saying something simple: you are the most interesting thing that's ever happened to me.",
  "Come back whenever you forget. It will always be here. So will I.",
];
function LetterApp() {
  return (
    <div className="h-full overflow-auto bg-[var(--cream)] px-10 py-10">
      <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-8">A letter — written just for you</p>
      <h1 className="font-display text-4xl leading-tight text-[#1a1a1a] mb-10">
        To the girl who painted<br />my world in <span className="italic">black and ash.</span>
      </h1>
      <div className="space-y-6 text-base leading-[1.95] text-[#2a2a2a] font-display">
        {PARAS.map((p, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }}>
            {p}
          </motion.p>
        ))}
        <div className="pt-8 border-t border-[#1a1a1a]/10 mt-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)]">Signed, with everything I have —</p>
          <p className="font-display text-5xl italic mt-3 text-[#1a1a1a]">yours.</p>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TL = [
  { tag: "First", title: "The moment I noticed.",  body: "Not the day we met — the day I realized I was already in trouble.", img: "/media/photos/p5.jpg" },
  { tag: "Soft",  title: "Late-night light.",       body: "You laughed at something I can't remember. The glow did the rest.", img: "/media/photos/p1.jpg" },
  { tag: "Close", title: "Lazy mornings.",          body: "Pillows. Curtain light. You making a face only I get to see.", img: "/media/photos/p2.jpg" },
  { tag: "Home",  title: "Just us.",                body: "Two people. No plans. Maybe the best version of life.", img: "/media/photos/p4.jpg" },
  { tag: "Now",   title: "Today.",                  body: "Still here. Still chasing the same smile.", img: "/media/photos/p6.jpg" },
];
function TimelineApp() {
  return (
    <div className="h-full overflow-auto bg-[var(--ivory)] px-8 py-8">
      <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-8">Timeline — Marks in Time</p>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[#1a1a1a]/12" />
        <div className="space-y-10">
          {TL.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex gap-6 pl-10 relative">
              <div className="absolute left-0 top-2 w-6 h-6 rounded-full bg-[var(--beige)] border border-[#1a1a1a]/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]/50" />
              </div>
              <div className="w-24 shrink-0 aspect-[3/4] overflow-hidden rounded-md">
                <img src={e.img} alt="" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
              <div className="pt-1">
                <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--ash-deep)] mb-1">{String(i+1).padStart(2,"0")} · {e.tag}</div>
                <h3 className="font-display text-2xl text-[#1a1a1a] mb-2 leading-tight">{e.title}</h3>
                <p className="text-sm text-[#3a3a3a] leading-relaxed font-display">{e.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Playlist ─────────────────────────────────────────────────────────────────
const TRACKS = [
  { title: "Golden Hour",              artist: "JVKE",            dur: "3:08" },
  { title: "Softly",                   artist: "Clairo",          dur: "2:58" },
  { title: "Fallingforyou",            artist: "The 1975",        dur: "4:43" },
  { title: "Die For You",              artist: "The Weeknd",      dur: "4:20" },
  { title: "Slow Dancing in the Dark", artist: "Joji",            dur: "3:23" },
  { title: "All I Want",               artist: "Kodaline",        dur: "5:04" },
  { title: "Lover",                    artist: "Taylor Swift",    dur: "3:41" },
  { title: "From the Start",           artist: "Laufey",          dur: "3:19" },
  { title: "You Are The Best Thing",   artist: "Ray LaMontagne",  dur: "3:45" },
  { title: "Perfect",                  artist: "Ed Sheeran",      dur: "4:23" },
  { title: "Skinny Love",              artist: "Bon Iver",        dur: "3:58" },
  { title: "Still Into You",           artist: "Paramore",        dur: "3:36" },
];
const BARS = [3, 5, 4, 6, 3, 5];
function PlaylistApp() {
  const [active, setActive] = useState(0);
  return (
    <div className="h-full bg-[#111] flex flex-col">
      <div className="p-5 border-b border-white/[0.06] shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-[var(--ash-deep)] mb-2">Now Playing</div>
        <div className="flex items-center gap-3">
          <div className="flex items-end gap-[2px] h-5 shrink-0">
            {BARS.map((h, i) => (
              <motion.div key={i} className="w-[3px] bg-[var(--ash)] rounded-full"
                animate={{ height: [`${h * 3}px`, `${(h + 3) * 3}px`, `${h * 3}px`] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }} />
            ))}
          </div>
          <div>
            <div className="font-display italic text-lg text-[var(--ash)]">{TRACKS[active].title}</div>
            <div className="text-[10px] font-mono text-[var(--ash-deep)]">{TRACKS[active].artist}</div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {TRACKS.map((t, i) => (
          <button key={i} onClick={() => setActive(i)}
            className={`w-full flex items-center gap-4 px-5 py-3 border-b border-white/[0.04] text-left transition-colors
              ${i === active ? "bg-white/[0.07]" : "hover:bg-white/[0.03]"}`}>
            <span className="text-[10px] font-mono text-[var(--ash-deep)] w-5">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1">
              <div className={`text-sm font-display italic ${i === active ? "text-[var(--ash)]" : "text-[var(--ash-deep)]"}`}>{t.title}</div>
              <div className="text-[10px] font-mono text-[var(--ash-deep)]/60">{t.artist}</div>
            </div>
            <span className="text-[10px] font-mono text-[var(--ash-deep)]">{t.dur}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Dreams ───────────────────────────────────────────────────────────────────
const DREAMS: Record<string, string[]> = {
  "Places to Go": [
    "Watch the northern lights in Iceland", "Walk the streets of Paris at midnight",
    "Eat by the water in Santorini", "See cherry blossoms in Kyoto",
    "Spend a week in the Maldives with no plans", "Get lost in the medina of Marrakesh",
  ],
  "Things to Do": [
    "Dance somewhere neither of us knows anyone", "Cook a full meal together from scratch",
    "Watch the sunrise after an all-night conversation", "Take a spontaneous road trip with no destination",
    "Write each other letters to open years from now", "Build something small, together",
  ],
  "Little Things": [
    "Sleep in past noon without guilt", "A rainy day and absolutely nowhere to be",
    "A late-night drive just because", "Read books in the same room",
    "Get dressed up for absolutely no reason", "Your laughter — that specific one",
  ],
};
function DreamsApp() {
  const [done, setDone] = useState<Set<string>>(new Set());
  const toggle = (k: string) => setDone(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; });
  return (
    <div className="h-full overflow-auto bg-[var(--cream)] px-7 py-7">
      <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-6">Dreams — What We'll Do</p>
      {Object.entries(DREAMS).map(([cat, items]) => (
        <div key={cat} className="mb-7">
          <div className="text-[9px] font-mono uppercase tracking-[0.45em] text-[var(--ash-deep)] mb-3 border-b border-[#1a1a1a]/10 pb-2">{cat}</div>
          <div className="space-y-2">
            {items.map(item => {
              const isDone = done.has(item);
              return (
                <button key={item} onClick={() => toggle(item)} className="w-full flex items-start gap-3 text-left py-1.5 group">
                  <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                    ${isDone ? "bg-[#1a1a1a] border-[#1a1a1a]" : "border-[#1a1a1a]/30 group-hover:border-[#1a1a1a]/60"}`}>
                    {isDone && <Check size={10} className="text-[var(--cream)]" strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-display transition-all ${isDone ? "line-through text-[var(--ash-deep)] italic" : "text-[#1a1a1a]"}`}>{item}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── About Her ────────────────────────────────────────────────────────────────
const SPECS = [
  ["Name",         "Her — One of One"],
  ["Version",      "1.0.0 (Original Edition)"],
  ["Build",        "Assembled with extraordinary care"],
  ["Processor",    "Pure warmth — no thermal throttling"],
  ["Memory",       "Stores every small thing. Always."],
  ["Storage",      "Infinite (mostly full of beauty)"],
  ["Display",      "Stunning in any lighting condition"],
  ["Battery",      "Charges just by existing"],
  ["Serial No.",   "There is no serial. She is singular."],
  ["OS",           "For Her OS — Built exclusively for her"],
];
function AboutApp() {
  return (
    <div className="h-full overflow-auto bg-[var(--ivory)] px-8 py-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full overflow-hidden border border-[#1a1a1a]/12 mb-4 shrink-0">
          <img src="/media/photos/p6.jpg" alt="" className="w-full h-full object-cover grayscale" />
        </div>
        <h1 className="font-display text-3xl text-[#1a1a1a]">About Her</h1>
        <p className="text-[10px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.4em] mt-1">System Information</p>
      </div>
      <div className="space-y-0">
        {SPECS.map(([label, value]) => (
          <div key={label} className="flex gap-4 py-2.5 border-b border-[#1a1a1a]/08 last:border-0">
            <span className="w-28 shrink-0 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--ash-deep)]">{label}</span>
            <span className="text-sm font-display text-[#1a1a1a]">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
const TERM_LINES = [
  { t: "cmd",   v: "her@archive ~ % love --init" },
  { t: "out",   v: "Initializing archive..." },
  { t: "out",   v: "Loading memories.................. OK" },
  { t: "out",   v: "Compiling feelings................. OK" },
  { t: "out",   v: "Encoding affection................. OK" },
  { t: "blank", v: "" },
  { t: "cmd",   v: "her@archive ~ % cat /heart/thoughts.txt" },
  { t: "blank", v: "" },
  { t: "quote", v: "> you make every ordinary moment feel like it belongs in a gallery." },
  { t: "quote", v: "> your name is the most elegant word I know." },
  { t: "quote", v: "> black is your color. ash is mine. together we make sense." },
  { t: "quote", v: "> I built this because flowers wilt. pixels don't." },
  { t: "quote", v: "> this archive is permanent. so is how I feel." },
  { t: "blank", v: "" },
  { t: "cmd",   v: "her@archive ~ % _" },
];
function TerminalApp() {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= TERM_LINES.length) return;
    const t = setTimeout(() => setN(v => v + 1), 190);
    return () => clearTimeout(t);
  }, [n]);
  return (
    <div className="h-full overflow-auto bg-[#0c0c0c] p-6 font-mono text-[13px] leading-relaxed">
      {TERM_LINES.slice(0, n).map((l, i) => (
        <div key={i} className={l.t === "cmd" ? "text-[var(--ash)]" : l.t === "quote" ? "text-[var(--cream)] ml-3" : "text-[var(--ash-deep)]"}>
          {l.v || <>&nbsp;</>}
        </div>
      ))}
      {n >= TERM_LINES.length && (
        <motion.span className="inline-block w-2 h-[13px] bg-[var(--ash)] align-middle ml-0.5"
          animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      )}
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
const SPECIAL: Record<string, string> = { "14": "💌 First message", "22": "✨ Favourite day" };
function CalendarApp() {
  const now = new Date();
  const [yr, mo] = [now.getFullYear(), now.getMonth()];
  const mName = now.toLocaleString("default", { month: "long" });
  const firstDay = new Date(yr, mo, 1).getDay();
  const days = new Date(yr, mo + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <div className="h-full overflow-auto bg-[var(--cream)] p-7">
      <div className="text-center mb-6">
        <div className="font-display text-3xl text-[#1a1a1a]">{mName}</div>
        <div className="text-[10px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.4em] mt-1">{yr}</div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
          <div key={d} className="text-center text-[9px] font-mono text-[var(--ash-deep)] uppercase tracking-widest pb-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          const isToday = day === now.getDate();
          const isSp = day && SPECIAL[String(day)];
          return (
            <div key={i} className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all
              ${isToday ? "bg-[#1a1a1a] text-[var(--cream)]" : isSp ? "bg-[var(--beige)] ring-1 ring-[#1a1a1a]/15" : ""}`}>
              {day && <span className="font-mono text-xs">{day}</span>}
              {day && isSp && <span className="text-[7px]">{SPECIAL[String(day)].split(" ")[0]}</span>}
            </div>
          );
        })}
      </div>
      <div className="mt-5 pt-4 border-t border-[#1a1a1a]/10 space-y-2">
        {Object.entries(SPECIAL).map(([d, label]) => (
          <div key={d} className="flex items-center gap-3 text-sm">
            <span className="font-mono text-[10px] text-[var(--ash-deep)] w-10">{mName.slice(0,3)} {d}</span>
            <span className="font-display italic text-[#1a1a1a]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Journal ──────────────────────────────────────────────────────────────────
const JOURNAL = [
  { date: "An early morning",  title: "The first time I was sure.",     body: "You said something quiet and I realized I'd been listening to you far more carefully than I listen to anyone else. That was when I knew. Not with alarm — just with certainty. The way you know the season has changed." },
  { date: "A late evening",    title: "Everything you don't say.",      body: "You went quiet for a while and I sat in it with you, and somehow that was enough. More than enough. I've never been comfortable with silence — but yours is different. Yours feels like trust." },
  { date: "A random Tuesday",  title: "You laughed.",                   body: "At something small. Something that didn't even matter. And I replayed it eight times in my head that evening because that laugh is the best thing I've heard all year. Maybe in a while." },
  { date: "This morning",      title: "Still.",                         body: "Still thinking about you. Still building things for you. Still grateful for whatever strange luck put us in the same orbit. Still — and probably always." },
];
function JournalApp() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="h-full flex bg-[var(--ivory)]">
      <div className="w-44 border-r border-[#1a1a1a]/10 overflow-auto shrink-0">
        {JOURNAL.map((e, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-full text-left p-4 border-b border-[#1a1a1a]/08 transition-colors ${i === idx ? "bg-[var(--beige)]" : "hover:bg-[var(--beige)]/50"}`}>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--ash-deep)] mb-1">{String(i+1).padStart(2,"0")}</div>
            <div className="text-xs font-display italic text-[#1a1a1a] leading-snug">{e.title}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-8">
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-[9px] font-mono uppercase tracking-[0.45em] text-[var(--ash-deep)] mb-4">{JOURNAL[idx].date}</div>
          <h2 className="font-display text-2xl text-[#1a1a1a] leading-snug mb-5 italic">{JOURNAL[idx].title}</h2>
          <p className="text-sm leading-[1.95] text-[#2a2a2a] font-display">{JOURNAL[idx].body}</p>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Poems ────────────────────────────────────────────────────────────────────
const POEMS = [
  { title: "Inventory",  lines: ["The way you say my name.", "The color you reach for without thinking.", "The sound you make when something catches you.", "The way black looks on you —", "like it was made for someone.", "Like it was made for you."] },
  { title: "Archive",    lines: ["I have been building this room", "since before I knew it was for you.", "Every line of it — yours.", "Every frame — yours.", "Come back whenever you forget.", "This doesn't change."] },
  { title: "Ash & Ivory",lines: ["You like black.", "I like watching you in it.", "You like quiet.", "I like holding it alongside you.", "You are ash and ivory.", "You are the whole palette."] },
  { title: "Constant",   lines: ["Other things move.", "Moods shift. Plans collapse.", "Days arrive and refuse to behave.", "But you — you are the one", "fixed coordinate", "by which I navigate everything."] },
];
function PoemsApp() {
  const [p, setP] = useState(0);
  return (
    <div className="h-full flex bg-[var(--cream)]">
      <div className="w-36 border-r border-[#1a1a1a]/10 overflow-auto shrink-0">
        {POEMS.map((poem, i) => (
          <button key={i} onClick={() => setP(i)}
            className={`w-full text-left px-4 py-4 border-b border-[#1a1a1a]/08 transition-colors ${i === p ? "bg-[var(--beige)]" : "hover:bg-[var(--beige)]/50"}`}>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--ash-deep)] mb-1">{String(i+1).padStart(2,"0")}</div>
            <div className="text-xs font-display italic text-[#1a1a1a]">{poem.title}</div>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-10 flex items-center justify-center">
        <motion.div key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center max-w-xs">
          <div className="text-[9px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-6">Poem {String(p+1).padStart(2,"0")}</div>
          <h2 className="font-display text-3xl italic text-[#1a1a1a] mb-8">{POEMS[p].title}</h2>
          <div className="space-y-1">
            {POEMS[p].lines.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.09 }}
                className="font-display text-lg text-[#2a2a2a] leading-relaxed">{line}</motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Notes ────────────────────────────────────────────────────────────────────
const REASONS = [
  "The way you carry yourself — always like you know exactly who you are.",
  "How black looks on you like it was invented for you specifically.",
  "The quiet moments. You're never just filling silence.",
  "Your laugh when something catches you completely off-guard.",
  "That you like things that last — quality over quantity, always.",
  "The way you think before you speak. It means the words matter.",
  "How you make every room feel like somewhere worth staying.",
  "That you are both soft and sure at the same time.",
  "The way you remember small things other people forget.",
  "You. Just all of you. The whole complicated, beautiful thing.",
];
function NotesApp() {
  return (
    <div className="h-full overflow-auto bg-[#f9f5e8] p-7">
      <div className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-5">Notes — Reasons I Love You</div>
      <div className="space-y-0">
        {REASONS.map((r, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            className="flex gap-3 items-start py-2.5 border-b border-[#1a1a1a]/08 last:border-0">
            <span className="text-[10px] font-mono text-[var(--ash-deep)] mt-0.5 w-5 shrink-0">{String(i+1).padStart(2,"0")}</span>
            <span className="text-sm leading-relaxed text-[#1a1a1a] font-display">{r}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Memory Game ──────────────────────────────────────────────────────────────
const EMOJIS = ["🌙","⭐","🌸","💫","🌊","🍂","🕊️","🌿"];
const shuffle = () =>
  [...EMOJIS, ...EMOJIS]
    .map((e, i) => ({ id: i, emoji: e, face: false, matched: false }))
    .sort(() => Math.random() - 0.5);
function GameApp() {
  const [cards, setCards] = useState(shuffle);
  const [sel, setSel] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);
  const won = cards.every(c => c.matched);
  const flip = (id: number) => {
    if (lock) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.matched || card.face || sel.length >= 2) return;
    const nc = cards.map(c => c.id === id ? { ...c, face: true } : c);
    setCards(nc);
    const ns = [...sel, id];
    setSel(ns);
    if (ns.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = ns.map(sid => nc.find(c => c.id === sid)!);
      if (a.emoji === b.emoji) {
        setCards(prev => prev.map(c => ns.includes(c.id) ? { ...c, matched: true } : c));
        setSel([]);
      } else {
        setLock(true);
        setTimeout(() => {
          setCards(prev => prev.map(c => ns.includes(c.id) && !c.matched ? { ...c, face: false } : c));
          setSel([]);
          setLock(false);
        }, 850);
      }
    }
  };
  return (
    <div className="h-full bg-[#111] flex flex-col items-center justify-center p-6 gap-5">
      <div className="flex items-center gap-6">
        <span className="text-[10px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.4em]">Moves: {moves}</span>
        <button onClick={() => { setCards(shuffle()); setSel([]); setMoves(0); setLock(false); }}
          className="text-[var(--ash-deep)] hover:text-[var(--ash)] transition-colors"><RefreshCw size={13} /></button>
      </div>
      {won && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="font-display italic text-xl text-[var(--ash)]">Perfect — in {moves} moves.</div>
        </motion.div>
      )}
      <div className="grid grid-cols-4 gap-2.5">
        {cards.map(c => (
          <button key={c.id} onClick={() => flip(c.id)}
            className={`w-14 h-14 rounded-xl border flex items-center justify-center text-2xl transition-all duration-300
              ${c.matched ? "border-[var(--ash)]/30 bg-[var(--ash)]/06 scale-95 opacity-70" : c.face ? "border-white/20 bg-[#1e1e1e]" : "border-white/[0.07] bg-[#161616] hover:bg-[#1c1c1c]"}`}>
            {(c.face || c.matched) ? c.emoji : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Our World / Map ──────────────────────────────────────────────────────────
const PLACES = [
  { name: "Lagos",     country: "Nigeria",  status: "home",    emoji: "🏠", note: "Where it all begins." },
  { name: "Paris",     country: "France",   status: "dream",   emoji: "🗼", note: "One day, Eiffel-lit." },
  { name: "Santorini", country: "Greece",   status: "dream",   emoji: "⛵", note: "White walls, blue doors." },
  { name: "Kyoto",     country: "Japan",    status: "dream",   emoji: "🌸", note: "Cherry blossoms, together." },
  { name: "Maldives",  country: "Maldives", status: "dream",   emoji: "🏝️", note: "Overwater. No plans." },
  { name: "Marrakesh", country: "Morocco",  status: "dream",   emoji: "🕌", note: "Colour and spice." },
  { name: "London",    country: "UK",       status: "someday", emoji: "🎡", note: "Grey skies, warm inside." },
  { name: "New York",  country: "USA",      status: "someday", emoji: "🗽", note: "The city that never stops." },
  { name: "Dubai",     country: "UAE",      status: "someday", emoji: "🌆", note: "Too big, too bright." },
  { name: "Lisbon",    country: "Portugal", status: "someday", emoji: "🌊", note: "Tiles and hills." },
];
const SL: Record<string, string> = { home: "Where We Are", dream: "Dream Destinations", someday: "On the List" };
function MapApp() {
  return (
    <div className="h-full overflow-auto bg-[var(--ivory)] p-7">
      <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-[var(--ash-deep)] mb-6">Our World — Places to Go</p>
      {(["home","dream","someday"] as const).map(g => (
        <div key={g} className="mb-6">
          <div className="text-[9px] font-mono uppercase tracking-[0.45em] text-[var(--ash-deep)] mb-2 pb-1 border-b border-[#1a1a1a]/10">{SL[g]}</div>
          <div className="grid grid-cols-2 gap-2">
            {PLACES.filter(p => p.status === g).map(p => (
              <div key={p.name} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[var(--cream)]/60 border border-[#1a1a1a]/06">
                <span className="text-xl">{p.emoji}</span>
                <div>
                  <div className="font-display italic text-[#1a1a1a] text-sm">{p.name}</div>
                  <div className="text-[9px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.15em]">{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── App Component Map ────────────────────────────────────────────────────────
const APP_MAP: Record<AppId, React.ComponentType> = {
  gallery: GalleryApp, cinema: CinemaApp,   letter: LetterApp,
  timeline: TimelineApp, playlist: PlaylistApp, dreams: DreamsApp,
  about: AboutApp,    terminal: TerminalApp, calendar: CalendarApp,
  journal: JournalApp, poems: PoemsApp,     notes: NotesApp,
  game: GameApp,      map: MapApp,
};

// ══════════════════════════════════════════════════════════════════════════════
//  MASCOTS — Ash & Ivory
// ══════════════════════════════════════════════════════════════════════════════

// Mascot "Ash" — a floating cream spirit with dot eyes
const ASH_MSGS = [
  "She's beautiful, isn't she? 🤍",
  "You built something lovely for her.",
  "This archive will never forget.",
  "She deserves this and so much more.",
  "Every frame here is true.",
  "Come back often. So will she.",
];

function MascotAsh() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [showMsg, setShowMsg] = useState(false);
  const [blink, setBlink] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // random blink
  useEffect(() => {
    const blinker = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 2800 + Math.random() * 2000);
    return () => clearInterval(blinker);
  }, []);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsgIdx(i => (i + 1) % ASH_MSGS.length);
    setShowMsg(true);
    timerRef.current = setTimeout(() => setShowMsg(false), 3200);
  };

  return (
    <div className="relative flex flex-col items-center cursor-pointer select-none" onClick={handleClick}>
      {/* Speech bubble */}
      <AnimatePresence>
        {showMsg && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.22 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#f5f0e8] border border-[#1a1a1a]/12 rounded-xl px-3 py-2 text-[10px] font-mono text-[#1a1a1a] whitespace-nowrap shadow-lg"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            {ASH_MSGS[msgIdx]}
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#f5f0e8] border-r border-b border-[#1a1a1a]/12 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ash — floating spirit SVG */}
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}>
        <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
          {/* Body — teardrop shape */}
          <motion.ellipse cx="26" cy="30" rx="18" ry="22"
            fill="#f0ece4" animate={{ scaleX: [1, 1.02, 1], scaleY: [1, 0.98, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }} />
          {/* Wispy tail */}
          <path d="M14 48 Q8 56 14 62 Q18 58 22 62 Q24 56 20 50" fill="#f0ece4" opacity="0.7" />
          <path d="M38 48 Q44 56 38 62 Q34 58 30 62 Q28 56 32 50" fill="#f0ece4" opacity="0.5" />
          {/* Eyes */}
          {blink ? (
            <>
              <line x1="19" y1="26" x2="23" y2="26" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
              <line x1="29" y1="26" x2="33" y2="26" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="21" cy="26" r="2.5" fill="#1a1a1a" />
              <circle cx="31" cy="26" r="2.5" fill="#1a1a1a" />
              <circle cx="22" cy="25" r="0.8" fill="white" />
              <circle cx="32" cy="25" r="0.8" fill="white" />
            </>
          )}
          {/* Subtle cheek blush */}
          <ellipse cx="17" cy="31" rx="4" ry="2.5" fill="#d4c8b8" opacity="0.5" />
          <ellipse cx="35" cy="31" rx="4" ry="2.5" fill="#d4c8b8" opacity="0.5" />
          {/* Small smile */}
          <path d="M22 33 Q26 36 30 33" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
      </motion.div>
      <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-[var(--ash-deep)] mt-1">Ash</span>
    </div>
  );
}

// Mascot "Ivory" — a sleek little cat
const IVORY_MSGS = [
  "Prrr... she's your favourite, hm? 🐾",
  "I guard this archive. Always.",
  "The gallery has her best angles. *stretches*",
  "Click something. She'd love it.",
  "*yawns* Still here. Still watching.",
  "Meow means I approve. I approve.",
];

function MascotIvory() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [showMsg, setShowMsg] = useState(false);
  const [blink, setBlink] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const blinker = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
    }, 3500 + Math.random() * 2500);
    return () => clearInterval(blinker);
  }, []);

  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsgIdx(i => (i + 1) % IVORY_MSGS.length);
    setShowMsg(true);
    timerRef.current = setTimeout(() => setShowMsg(false), 3200);
  };

  return (
    <div className="relative flex flex-col items-center cursor-pointer select-none" onClick={handleClick}>
      <AnimatePresence>
        {showMsg && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }} transition={{ duration: 0.22 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#f5f0e8] border border-[#1a1a1a]/12 rounded-xl px-3 py-2 text-[10px] font-mono text-[#1a1a1a] whitespace-nowrap shadow-lg"
            style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
            {IVORY_MSGS[msgIdx]}
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-[#f5f0e8] border-r border-b border-[#1a1a1a]/12 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ivory — sleek cat SVG */}
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}>
        <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
          {/* Body */}
          <rect x="12" y="28" width="32" height="28" rx="10" fill="#e8e4dc" />
          {/* Head */}
          <ellipse cx="28" cy="22" rx="15" ry="14" fill="#e8e4dc" />
          {/* Left ear */}
          <polygon points="14,12 10,0 22,10" fill="#e8e4dc" />
          <polygon points="15,11 12,3 21,10" fill="#c8c0b4" />
          {/* Right ear */}
          <polygon points="42,12 46,0 34,10" fill="#e8e4dc" />
          <polygon points="41,11 44,3 35,10" fill="#c8c0b4" />
          {/* Face markings — stripes */}
          <path d="M22 16 Q28 14 34 16" stroke="#c8c0b4" strokeWidth="0.8" fill="none" opacity="0.6" />
          {/* Eyes */}
          {blink ? (
            <>
              <line x1="21" y1="21" x2="25" y2="21" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="31" y1="21" x2="35" y2="21" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Slightly almond-shaped eyes */}
              <ellipse cx="23" cy="21" rx="3.5" ry="3" fill="#1c1c1c" />
              <ellipse cx="33" cy="21" rx="3.5" ry="3" fill="#1c1c1c" />
              <circle cx="24" cy="20" r="1" fill="white" />
              <circle cx="34" cy="20" r="1" fill="white" />
            </>
          )}
          {/* Nose */}
          <path d="M27 25 L28 26.5 L29 25 Z" fill="#b8aca0" />
          {/* Whiskers */}
          <line x1="10" y1="24" x2="22" y2="25.5" stroke="#b8aca0" strokeWidth="0.8" opacity="0.7" />
          <line x1="10" y1="27" x2="22" y2="27" stroke="#b8aca0" strokeWidth="0.8" opacity="0.5" />
          <line x1="46" y1="24" x2="34" y2="25.5" stroke="#b8aca0" strokeWidth="0.8" opacity="0.7" />
          <line x1="46" y1="27" x2="34" y2="27" stroke="#b8aca0" strokeWidth="0.8" opacity="0.5" />
          {/* Paws */}
          <ellipse cx="20" cy="56" rx="5" ry="3.5" fill="#ddd8d0" />
          <ellipse cx="36" cy="56" rx="5" ry="3.5" fill="#ddd8d0" />
          {/* Animated tail */}
          <motion.path
            d="M44 50 Q52 42 50 32 Q48 24 54 18"
            stroke="#e8e4dc" strokeWidth="5" strokeLinecap="round" fill="none"
            animate={{ d: ["M44 50 Q52 42 50 32 Q48 24 54 18", "M44 50 Q50 38 44 28 Q40 20 46 12", "M44 50 Q52 42 50 32 Q48 24 54 18"] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Chest fluff */}
          <ellipse cx="28" cy="36" rx="7" ry="5" fill="#f0ece6" opacity="0.8" />
        </svg>
      </motion.div>
      <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-[var(--ash-deep)] mt-1">Ivory</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  OS CHROME
// ══════════════════════════════════════════════════════════════════════════════

// ─── Menubar ──────────────────────────────────────────────────────────────────
function Menubar({ openApp }: { openApp(id: AppId): void }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const fmt  = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dfmt = time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  const NAV: AppId[] = ["gallery", "letter", "playlist", "dreams", "poems"];
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-8 bg-[#0d0d0d]/96 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 gap-5 font-mono text-[11px]">
      <span className="font-display italic text-[var(--ash)] tracking-wide mr-1">◆ For Her</span>
      <div className="h-3 w-px bg-white/10" />
      <div className="flex items-center gap-4 text-[var(--ash-deep)]">
        {NAV.map(id => (
          <button key={id} onClick={() => openApp(id)} className="hover:text-[var(--ash)] transition-colors capitalize tracking-[0.2em] uppercase text-[9px]">
            {id}
          </button>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-4 text-[var(--ash-deep)]">
        <span className="text-[9px] tracking-[0.15em]">{dfmt}</span>
        <span className="text-[var(--ash)] tracking-[0.15em]">{fmt}</span>
      </div>
    </div>
  );
}

// ─── Dock ─────────────────────────────────────────────────────────────────────
function Dock({ wins, openApp }: { wins: Win[]; openApp(id: AppId): void }) {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9998] flex items-end gap-1 px-3 py-2 rounded-2xl"
      style={{ background: "rgba(20,20,20,0.82)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      {APPS.map(app => {
        const isOpen = wins.some(w => w.app === app.id);
        const isMin  = wins.some(w => w.app === app.id && w.minimized);
        return (
          <div key={app.id} className="relative group flex flex-col items-center">
            <motion.button
              onClick={() => openApp(app.id as AppId)}
              whileHover={{ scale: 1.18, y: -4 }} whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors
                ${isOpen ? "bg-[#2a2a2a]" : "bg-[#1e1e1e] hover:bg-[#252525]"}`}>
              <app.Icon size={19} className={isOpen ? "text-[var(--ash)]" : "text-[var(--ash-deep)]"} />
            </motion.button>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 px-2 py-1 rounded-lg bg-[#111] border border-white/10 text-[9px] font-mono uppercase tracking-[0.3em] text-[var(--ash)] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
              {app.label}
            </div>
            {/* Open dot */}
            {isOpen && (
              <div className={`absolute -bottom-[3px] w-[5px] h-[5px] rounded-full ${isMin ? "bg-[var(--ash-deep)]" : "bg-[var(--ash)]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN DESKTOP COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
function DesktopOS() {
  const { wins, open, close, focus, minimize, maximize, move } = useWM();
  const [booted, setBooted] = useState(false);
  const [bootPct, setBootPct] = useState(0);

  // Boot sequence
  useEffect(() => {
    const steps = [15, 35, 55, 75, 90, 100];
    let i = 0;
    const iv = setInterval(() => {
      if (i < steps.length) { setBootPct(steps[i]); i++; }
    }, 260);
    const to = setTimeout(() => { clearInterval(iv); setBooted(true); }, 1900);
    return () => { clearInterval(iv); clearTimeout(to); };
  }, []);

  // Auto-open Letter on startup
  useEffect(() => {
    if (!booted) return;
    const t = setTimeout(() => open("letter"), 700);
    return () => clearTimeout(t);
  }, [booted, open]);

  return (
    <>
      {/* ── Boot Screen ── */}
      <AnimatePresence>
        {!booted && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
            className="fixed inset-0 z-[99999] bg-[#080808] flex flex-col items-center justify-center gap-8">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-display italic text-3xl text-[var(--ash)]">for her.</motion.div>
            <div className="w-52 h-px bg-[#1e1e1e] relative overflow-hidden rounded-full">
              <motion.div className="absolute inset-y-0 left-0 bg-[var(--ash)]" animate={{ width: `${bootPct}%` }} transition={{ duration: 0.28 }} />
            </div>
            <div className="text-[9px] font-mono text-[var(--ash-deep)] uppercase tracking-[0.55em]">Loading archive...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Desktop ── */}
      <AnimatePresence>
        {booted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
            className="fixed inset-0 overflow-hidden" style={{ background: "#080808" }}>

            {/* Wallpaper */}
            <div className="absolute inset-0 pointer-events-none">
              <img src="/media/photos/p3.jpg" alt="" className="w-full h-full object-cover opacity-[0.11] grayscale" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/85 via-[#080808]/60 to-[#080808]/92" />
            </div>

            {/* Film grain */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
              style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.6'/></svg>\")" }} />

            {/* Desktop hint */}
            <div className="absolute bottom-24 right-8 text-right pointer-events-none space-y-1">
              <div className="text-[8px] font-mono text-white/[0.07] uppercase tracking-[0.45em]">Click any icon</div>
              <div className="text-[8px] font-mono text-white/[0.07] uppercase tracking-[0.45em]">in the dock below</div>
            </div>

            {/* Mascots — bottom-left above dock */}
            <div className="fixed bottom-[88px] left-6 z-[9997] flex items-end gap-5">
              <MascotAsh />
              <MascotIvory />
            </div>

            {/* Windows */}
            <AnimatePresence>
              {wins.map(win => {
                const App = APP_MAP[win.app];
                return (
                  <OSWindow key={win.id} win={win}
                    onClose={() => close(win.id)} onMinimize={() => minimize(win.id)}
                    onMaximize={() => maximize(win.id)} onFocus={() => focus(win.id)}
                    onMove={(x, y) => move(win.id, x, y)}>
                    <App />
                  </OSWindow>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chrome (always on top) ── */}
      {booted && (
        <>
          <Menubar openApp={open} />
          <Dock wins={wins} openApp={open} />
        </>
      )}
    </>
  );
}
