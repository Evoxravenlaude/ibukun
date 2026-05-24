import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  BookOpen, CalendarDays, ChevronLeft, ChevronRight, Check,
  Feather, Film, Gamepad2, GitCommitVertical, Heart, Images,
  Info, Mail, MapPin, Music, RefreshCw, StickyNote, TerminalSquare,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Win {
  id: string; app: AppId
  x: number; y: number; w: number; h: number
  z: number; minimized: boolean; maximized: boolean
}

const APPS = [
  { id: 'gallery',  label: 'Gallery',   Icon: Images,            title: 'Gallery — Frames of You',    w: 820, h: 570 },
  { id: 'cinema',   label: 'Cinema',    Icon: Film,              title: 'Cinema — Living Stills',     w: 880, h: 540 },
  { id: 'letter',   label: 'Letter',    Icon: Mail,              title: 'Letter — For You',           w: 640, h: 660 },
  { id: 'timeline', label: 'Timeline',  Icon: GitCommitVertical, title: 'Timeline — Marks in Time',   w: 720, h: 580 },
  { id: 'playlist', label: 'Playlist',  Icon: Music,             title: 'Playlist — Songs for You',   w: 500, h: 560 },
  { id: 'dreams',   label: 'Dreams',    Icon: Heart,             title: 'Dreams — What We\'ll Do',    w: 520, h: 580 },
  { id: 'about',    label: 'About Her', Icon: Info,              title: 'About Her — System Info',    w: 480, h: 500 },
  { id: 'terminal', label: 'Terminal',  Icon: TerminalSquare,    title: 'Terminal — love.sh',         w: 620, h: 390 },
  { id: 'calendar', label: 'Calendar',  Icon: CalendarDays,      title: 'Calendar — Our Dates',       w: 480, h: 520 },
  { id: 'journal',  label: 'Journal',   Icon: BookOpen,          title: 'Journal — Private Entries',  w: 660, h: 590 },
  { id: 'poems',    label: 'Poems',     Icon: Feather,           title: 'Poems — Words for You',      w: 540, h: 560 },
  { id: 'notes',    label: 'Notes',     Icon: StickyNote,        title: 'Notes — Reasons',            w: 400, h: 500 },
  { id: 'game',     label: 'Memory',    Icon: Gamepad2,          title: 'Memory — Match the Cards',   w: 540, h: 500 },
  { id: 'map',      label: 'Our World', Icon: MapPin,            title: 'Our World — Places to Go',   w: 800, h: 540 },
] as const

type AppId = typeof APPS[number]['id']

// ─── Window Manager ───────────────────────────────────────────────────────────
function useWM() {
  const [wins, setWins] = useState<Win[]>([])
  const z = useRef(100)
  const open = useCallback((app: AppId) => {
    setWins(prev => {
      const ex = prev.find(w => w.app === app)
      if (ex) return prev.map(w => w.app === app ? { ...w, minimized: false, z: ++z.current } : w)
      const meta = APPS.find(a => a.id === app)!
      const vw = window.innerWidth, vh = window.innerHeight
      return [...prev, {
        id: `${app}-${Date.now()}`, app,
        x: Math.max(60, Math.min((vw - meta.w) / 2 + (Math.random() * 60 - 30), vw - meta.w - 20)),
        y: Math.max(40, Math.min((vh - meta.h) / 2 + (Math.random() * 50 - 25), vh - meta.h - 80)),
        w: meta.w, h: meta.h, z: ++z.current, minimized: false, maximized: false,
      }]
    })
  }, [])
  const close    = useCallback((id: string) => setWins(p => p.filter(w => w.id !== id)), [])
  const focus    = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, z: ++z.current, minimized: false } : w)), [])
  const minimize = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w)), [])
  const maximize = useCallback((id: string) => setWins(p => p.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w)), [])
  const move     = useCallback((id: string, x: number, y: number) => setWins(p => p.map(w => w.id === id ? { ...w, x, y } : w)), [])
  return { wins, open, close, focus, minimize, maximize, move }
}

// ─── Window Chrome ────────────────────────────────────────────────────────────
function OSWindow({ win, onClose, onMinimize, onMaximize, onFocus, onMove, children }: {
  win: Win; onClose(): void; onMinimize(): void; onMaximize(): void
  onFocus(): void; onMove(x: number, y: number): void; children: React.ReactNode
}) {
  const handleDrag = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault(); onFocus()
    const ox = e.clientX - win.x, oy = e.clientY - win.y
    const mm = (ev: MouseEvent) => onMove(ev.clientX - ox, Math.max(32, ev.clientY - oy))
    const mu = () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu) }
    document.addEventListener('mousemove', mm); document.addEventListener('mouseup', mu)
  }
  if (win.minimized) return null
  const boxStyle: React.CSSProperties = win.maximized
    ? { position: 'fixed', left: 0, top: 32, width: '100vw', height: 'calc(100vh - 32px)', zIndex: win.z }
    : { position: 'fixed', left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }
  return (
    <motion.div initial={{ scale: 0.88, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.88, opacity: 0 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ ...boxStyle, boxShadow: '0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden' }}
      onClick={onFocus}>
      <div onMouseDown={handleDrag}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 40,
          background: '#1c1c1e', borderBottom: '1px solid rgba(255,255,255,0.07)',
          userSelect: 'none', flexShrink: 0, cursor: 'grab' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onClose}    style={dot('#ff5f57')} title="Close" />
          <button onClick={onMinimize} style={dot('#febc2e')} title="Minimize" />
          <button onClick={onMaximize} style={dot('#28c840')} title="Maximize" />
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 10, color: '#555',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.35em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {APPS.find(a => a.id === win.app)?.title}
        </span>
        <div style={{ width: 56 }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>{children}</div>
    </motion.div>
  )
}
const dot = (bg: string): React.CSSProperties => ({
  width: 12, height: 12, borderRadius: '50%', background: bg,
  border: 'none', cursor: 'pointer', flexShrink: 0,
})

// ══════════════════════════════════════════════════════════════════════════════
//  APPS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Gallery ──────────────────────────────────────────────────────────────────
const PHOTOS = [
  { src: '/media/photos/p1.jpg', caption: 'Neon hush',      detail: 'Late night, soft glow.' },
  { src: '/media/photos/p2.jpg', caption: 'Slow afternoon', detail: 'Nowhere to be.' },
  { src: '/media/photos/p3.jpg', caption: 'Stay close',     detail: "Don't go." },
  { src: '/media/photos/p4.jpg', caption: 'That smile',     detail: 'The one that ruins me.' },
  { src: '/media/photos/p5.jpg', caption: 'Soft world',     detail: 'You made it soft.' },
  { src: '/media/photos/p6.jpg', caption: 'Sunlit',         detail: 'Golden everything.' },
]
function GalleryApp() {
  const [view, setView] = useState<number | null>(null)
  return (
    <div style={{ height: '100%', background: '#111', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div style={{ flex: 1, overflow: 'auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, alignContent: 'start' }}>
        {PHOTOS.map((p, i) => (
          <button key={i} onClick={() => setView(i)}
            style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', borderRadius: 6, border: 'none', cursor: 'pointer', padding: 0 }}
            onMouseEnter={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.filter = 'grayscale(0) scale(1.05)' }}
            onMouseLeave={e => { (e.currentTarget.querySelector('img') as HTMLImageElement).style.filter = 'grayscale(100%)' }}>
            <img src={p.src} alt={p.caption}
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'filter 0.7s, transform 0.7s', transform: 'scale(1)' }} />
            <div style={{ position: 'absolute', bottom: 8, left: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)' }}>{p.caption}</div>
            </div>
          </button>
        ))}
      </div>
      <AnimatePresence>
        {view !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setView(null)}>
            <button onClick={e => { e.stopPropagation(); setView(v => (v === 0 ? PHOTOS.length - 1 : v! - 1)) }}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 8 }}>
              <ChevronLeft size={24} />
            </button>
            <motion.div key={view} initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
              <img src={PHOTOS[view].src} alt="" style={{ maxHeight: '75vh', maxWidth: '80vw', objectFit: 'contain' }} />
              <div style={{ marginTop: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'rgba(255,255,255,0.9)' }}>{PHOTOS[view].caption}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: 4 }}>{PHOTOS[view].detail}</div>
              </div>
            </motion.div>
            <button onClick={e => { e.stopPropagation(); setView(v => (v === PHOTOS.length - 1 ? 0 : v! + 1)) }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 8 }}>
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Cinema ───────────────────────────────────────────────────────────────────
const VIDEOS = [
  { src: '/media/videos/v1.mp4', title: 'Moment I',   note: 'Caught in motion.' },
  { src: '/media/videos/v2.mp4', title: 'Moment II',  note: 'The way you move.' },
  { src: '/media/videos/v3.mp4', title: 'Moment III', note: 'Soft, unrehearsed.' },
  { src: '/media/videos/v4.mp4', title: 'Moment IV',  note: 'Replay forever.' },
]
function CinemaApp() {
  const [cur, setCur] = useState(0)
  return (
    <div style={{ height: '100%', background: '#0a0a0a', display: 'flex' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <video key={VIDEOS[cur].src} src={VIDEOS[cur].src} controls autoPlay playsInline
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--ash)' }}>{VIDEOS[cur].title}</div>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.3em' }}>{VIDEOS[cur].note}</div>
        </div>
      </div>
      <div style={{ width: 176, borderLeft: '1px solid rgba(255,255,255,0.06)', overflowY: 'auto', flexShrink: 0 }}>
        {VIDEOS.map((v, i) => (
          <button key={i} onClick={() => setCur(i)}
            style={{ width: '100%', textAlign: 'left', padding: 16, borderBottom: '1px solid rgba(255,255,255,0.04)',
              background: i === cur ? 'rgba(255,255,255,0.07)' : 'transparent', border: 'none', cursor: 'pointer', display: 'block' }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.3em', marginBottom: 4 }}>{String(i+1).padStart(2,'0')}</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ash)' }}>{v.title}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Letter ───────────────────────────────────────────────────────────────────
const PARAS = [
  "I'm not a poet. I never was. But every time I think of you, language starts to behave like one — softer, slower, careful with its weight.",
  "You like black. You like ash. Two colors most people overlook because they think there's nothing inside them. But I've seen what lives there — depth, warmth, the kind of quiet that holds you instead of leaving you alone.",
  "That's you. Quiet, but never empty. Soft, but never small. Still, but never still enough that I stop noticing.",
  "I built this little corner because flowers wilt and chocolates run out. But pixels — pixels can stay exactly where I put them, holding the shape of how I feel, unchanging while everything else moves.",
  "This whole archive is just one long way of saying something simple: you are the most interesting thing that's ever happened to me.",
  "Come back whenever you forget. It will always be here. So will I.",
]
function LetterApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--cream)', padding: '40px 40px' }}>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 32 }}>A letter — written just for you</p>
      <h1 className="display" style={{ fontSize: 36, lineHeight: 1.2, color: '#1a1a1a', marginBottom: 40 }}>
        To the girl who painted<br />my world in <span style={{ fontStyle: 'italic' }}>black and ash.</span>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, fontSize: 15, lineHeight: 1.95, color: '#2a2a2a', fontFamily: 'var(--font-display)' }}>
        {PARAS.map((p, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.6 }}>{p}</motion.p>
        ))}
        <div style={{ paddingTop: 32, borderTop: '1px solid rgba(26,26,26,0.1)', marginTop: 40 }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)' }}>Signed, with everything I have —</p>
          <p className="display" style={{ fontSize: 48, fontStyle: 'italic', marginTop: 12, color: '#1a1a1a' }}>yours.</p>
        </div>
      </div>
    </div>
  )
}

// ─── Timeline ─────────────────────────────────────────────────────────────────
const TL = [
  { tag: 'First', title: 'The moment I noticed.',  body: 'Not the day we met — the day I realized I was already in trouble.', img: '/media/photos/p5.jpg' },
  { tag: 'Soft',  title: 'Late-night light.',       body: "You laughed at something I can't remember. The glow did the rest.", img: '/media/photos/p1.jpg' },
  { tag: 'Close', title: 'Lazy mornings.',          body: 'Pillows. Curtain light. You making a face only I get to see.', img: '/media/photos/p2.jpg' },
  { tag: 'Home',  title: 'Just us.',                body: 'Two people. No plans. Maybe the best version of life.', img: '/media/photos/p4.jpg' },
  { tag: 'Now',   title: 'Today.',                  body: 'Still here. Still chasing the same smile.', img: '/media/photos/p6.jpg' },
]
function TimelineApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--ivory)', padding: '32px' }}>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 32 }}>Timeline — Marks in Time</p>
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 12, top: 0, bottom: 0, width: 1, background: 'rgba(26,26,26,0.12)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          {TL.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ display: 'flex', gap: 24, paddingLeft: 40, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 8, width: 24, height: 24, borderRadius: '50%', background: 'var(--beige)', border: '1px solid rgba(26,26,26,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(26,26,26,0.5)' }} />
              </div>
              <div style={{ width: 96, flexShrink: 0, aspectRatio: '3/4', overflow: 'hidden', borderRadius: 6 }}>
                <img src={e.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)', transition: 'filter 0.7s' }}
                  onMouseEnter={e => (e.currentTarget.style.filter = 'grayscale(0)')}
                  onMouseLeave={e => (e.currentTarget.style.filter = 'grayscale(100%)')} />
              </div>
              <div style={{ paddingTop: 4 }}>
                <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', marginBottom: 4 }}>{String(i+1).padStart(2,'0')} · {e.tag}</div>
                <h3 className="display" style={{ fontSize: 24, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.2 }}>{e.title}</h3>
                <p style={{ fontSize: 13, color: '#3a3a3a', lineHeight: 1.7, fontFamily: 'var(--font-display)' }}>{e.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Playlist ─────────────────────────────────────────────────────────────────
const TRACKS = [
  { title: 'Golden Hour',              artist: 'JVKE',           dur: '3:08' },
  { title: 'Softly',                   artist: 'Clairo',         dur: '2:58' },
  { title: 'Fallingforyou',            artist: 'The 1975',       dur: '4:43' },
  { title: 'Die For You',              artist: 'The Weeknd',     dur: '4:20' },
  { title: 'Slow Dancing in the Dark', artist: 'Joji',           dur: '3:23' },
  { title: 'All I Want',               artist: 'Kodaline',       dur: '5:04' },
  { title: 'Lover',                    artist: 'Taylor Swift',   dur: '3:41' },
  { title: 'From the Start',           artist: 'Laufey',         dur: '3:19' },
  { title: 'You Are The Best Thing',   artist: 'Ray LaMontagne', dur: '3:45' },
  { title: 'Perfect',                  artist: 'Ed Sheeran',     dur: '4:23' },
  { title: 'Skinny Love',              artist: 'Bon Iver',       dur: '3:58' },
  { title: 'Still Into You',           artist: 'Paramore',       dur: '3:36' },
]
const BARS = [3, 5, 4, 6, 3, 5]
function PlaylistApp() {
  const [active, setActive] = useState(0)
  return (
    <div style={{ height: '100%', background: '#111', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', marginBottom: 8 }}>Now Playing</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 20, flexShrink: 0 }}>
            {BARS.map((h, i) => (
              <motion.div key={i} style={{ width: 3, background: 'var(--ash)', borderRadius: 2 }}
                animate={{ height: [`${h*3}px`, `${(h+3)*3}px`, `${h*3}px`] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }} />
            ))}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--ash)' }}>{TRACKS[active].title}</div>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)' }}>{TRACKS[active].artist}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {TRACKS.map((t, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.04)', background: i === active ? 'rgba(255,255,255,0.07)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', width: 20 }}>{String(i+1).padStart(2,'0')}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: i === active ? 'var(--ash)' : 'var(--ash-deep)' }}>{t.title}</div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(115,112,105,0.6)' }}>{t.artist}</div>
            </div>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)' }}>{t.dur}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Dreams ───────────────────────────────────────────────────────────────────
const DREAMS: Record<string, string[]> = {
  'Places to Go': [
    'Watch the northern lights in Iceland', 'Walk the streets of Paris at midnight',
    'Eat by the water in Santorini', 'See cherry blossoms in Kyoto',
    'Spend a week in the Maldives with no plans', 'Get lost in the medina of Marrakesh',
  ],
  'Things to Do': [
    "Dance somewhere neither of us knows anyone", 'Cook a full meal together from scratch',
    'Watch the sunrise after an all-night conversation', 'Take a spontaneous road trip with no destination',
    'Write each other letters to open years from now', 'Build something small, together',
  ],
  'Little Things': [
    'Sleep in past noon without guilt', 'A rainy day and absolutely nowhere to be',
    'A late-night drive just because', 'Read books in the same room',
    'Get dressed up for absolutely no reason', 'Your laughter — that specific one',
  ],
}
function DreamsApp() {
  const [done, setDone] = useState<Set<string>>(new Set())
  const toggle = (k: string) => setDone(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s })
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--cream)', padding: '28px' }}>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 24 }}>Dreams — What We'll Do</p>
      {Object.entries(DREAMS).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.45em', color: 'var(--ash-deep)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid rgba(26,26,26,0.1)' }}>{cat}</div>
          {items.map(item => {
            const isDone = done.has(item)
            return (
              <button key={item} onClick={() => toggle(item)}
                style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer' }}>
                <div style={{ marginTop: 2, width: 16, height: 16, borderRadius: 4, border: `1px solid ${isDone ? '#1a1a1a' : 'rgba(26,26,26,0.3)'}`,
                  background: isDone ? '#1a1a1a' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone && <Check size={10} color="var(--cream)" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', color: isDone ? 'var(--ash-deep)' : '#1a1a1a',
                  textDecoration: isDone ? 'line-through' : 'none', fontStyle: isDone ? 'italic' : 'normal' }}>{item}</span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
const SPECS = [
  ['Name', 'Her — One of One'], ['Version', '1.0.0 (Original Edition)'],
  ['Build', 'Assembled with extraordinary care'], ['Processor', 'Pure warmth — no thermal throttling'],
  ['Memory', 'Stores every small thing. Always.'], ['Storage', 'Infinite (mostly full of beauty)'],
  ['Display', 'Stunning in any lighting condition'], ['Battery', 'Charges just by existing'],
  ['Serial No.', 'There is no serial. She is singular.'], ['OS', 'For Her OS — Built exclusively for her'],
]
function AboutApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--ivory)', padding: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(26,26,26,0.12)', marginBottom: 16 }}>
          <img src="/media/photos/p6.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
        </div>
        <h1 className="display" style={{ fontSize: 28, color: '#1a1a1a' }}>About Her</h1>
        <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.4em', marginTop: 4 }}>System Information</p>
      </div>
      {SPECS.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          <span style={{ width: 112, flexShrink: 0, fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--ash-deep)' }}>{label}</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--font-display)', color: '#1a1a1a' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Terminal ─────────────────────────────────────────────────────────────────
const TERM_LINES = [
  { t: 'cmd',   v: 'her@archive ~ % love --init' },
  { t: 'out',   v: 'Initializing archive...' },
  { t: 'out',   v: 'Loading memories.................. OK' },
  { t: 'out',   v: 'Compiling feelings................. OK' },
  { t: 'out',   v: 'Encoding affection................. OK' },
  { t: 'blank', v: '' },
  { t: 'cmd',   v: 'her@archive ~ % cat /heart/thoughts.txt' },
  { t: 'blank', v: '' },
  { t: 'quote', v: '> you make every ordinary moment feel like it belongs in a gallery.' },
  { t: 'quote', v: '> your name is the most elegant word I know.' },
  { t: 'quote', v: '> black is your color. ash is mine. together we make sense.' },
  { t: 'quote', v: "> I built this because flowers wilt. pixels don't." },
  { t: 'quote', v: '> this archive is permanent. so is how I feel.' },
  { t: 'blank', v: '' },
  { t: 'cmd',   v: 'her@archive ~ % _' },
]
function TerminalApp() {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= TERM_LINES.length) return
    const t = setTimeout(() => setN(v => v + 1), 190)
    return () => clearTimeout(t)
  }, [n])
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#0c0c0c', padding: 24, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.8 }}>
      {TERM_LINES.slice(0, n).map((l, i) => (
        <div key={i} style={{ color: l.t === 'cmd' ? 'var(--ash)' : l.t === 'quote' ? 'var(--cream)' : 'var(--ash-deep)', marginLeft: l.t === 'quote' ? 12 : 0 }}>
          {l.v || '\u00a0'}
        </div>
      ))}
      {n >= TERM_LINES.length && (
        <motion.span style={{ display: 'inline-block', width: 8, height: 13, background: 'var(--ash)', verticalAlign: 'middle', marginLeft: 2 }}
          animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      )}
    </div>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
const SPECIAL: Record<string, string> = { '14': '💌 First message', '22': '✨ Favourite day' }
function CalendarApp() {
  const now = new Date()
  const [yr, mo] = [now.getFullYear(), now.getMonth()]
  const mName = now.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(yr, mo, 1).getDay()
  const days = new Date(yr, mo + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--cream)', padding: 28 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="display" style={{ fontSize: 28, color: '#1a1a1a' }}>{mName}</div>
        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.4em', marginTop: 4 }}>{yr}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: 4 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          const isToday = day === now.getDate()
          const isSp = day && SPECIAL[String(day)]
          return (
            <div key={i} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 12,
              background: isToday ? '#1a1a1a' : isSp ? 'var(--beige)' : 'transparent', color: isToday ? 'var(--cream)' : '#1a1a1a' }}>
              {day && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{day}</span>}
              {day && isSp && <span style={{ fontSize: 7 }}>{SPECIAL[String(day)].split(' ')[0]}</span>}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(26,26,26,0.1)' }}>
        {Object.entries(SPECIAL).map(([d, label]) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ash-deep)', width: 40 }}>{mName.slice(0,3)} {d}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#1a1a1a' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Journal ──────────────────────────────────────────────────────────────────
const JOURNAL = [
  { date: 'An early morning',  title: 'The first time I was sure.',  body: "You said something quiet and I realized I'd been listening to you far more carefully than I listen to anyone else. That was when I knew. Not with alarm — just with certainty. The way you know the season has changed." },
  { date: 'A late evening',    title: 'Everything you don\'t say.',  body: "You went quiet for a while and I sat in it with you, and somehow that was enough. More than enough. I've never been comfortable with silence — but yours is different. Yours feels like trust." },
  { date: 'A random Tuesday',  title: 'You laughed.',                body: "At something small. Something that didn't even matter. And I replayed it eight times in my head that evening because that laugh is the best thing I've heard all year. Maybe in a while." },
  { date: 'This morning',      title: 'Still.',                      body: "Still thinking about you. Still building things for you. Still grateful for whatever strange luck put us in the same orbit. Still — and probably always." },
]
function JournalApp() {
  const [idx, setIdx] = useState(0)
  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--ivory)' }}>
      <div style={{ width: 176, borderRight: '1px solid rgba(26,26,26,0.1)', overflowY: 'auto', flexShrink: 0 }}>
        {JOURNAL.map((e, i) => (
          <button key={i} onClick={() => setIdx(i)}
            style={{ width: '100%', textAlign: 'left', padding: 16, borderBottom: '1px solid rgba(26,26,26,0.08)',
              background: i === idx ? 'var(--beige)' : 'transparent', border: 'none', cursor: 'pointer', display: 'block' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--ash-deep)', marginBottom: 4 }}>{String(i+1).padStart(2,'0')}</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#1a1a1a', lineHeight: 1.3 }}>{e.title}</div>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.45em', color: 'var(--ash-deep)', marginBottom: 16 }}>{JOURNAL[idx].date}</div>
          <h2 className="display" style={{ fontSize: 22, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 20, fontStyle: 'italic' }}>{JOURNAL[idx].title}</h2>
          <p style={{ fontSize: 13, lineHeight: 1.95, color: '#2a2a2a', fontFamily: 'var(--font-display)' }}>{JOURNAL[idx].body}</p>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Poems ────────────────────────────────────────────────────────────────────
const POEMS = [
  { title: 'Inventory',   lines: ['The way you say my name.', 'The color you reach for without thinking.', 'The sound you make when something catches you.', 'The way black looks on you —', 'like it was made for someone.', 'Like it was made for you.'] },
  { title: 'Archive',     lines: ['I have been building this room', 'since before I knew it was for you.', 'Every line of it — yours.', 'Every frame — yours.', 'Come back whenever you forget.', "This doesn't change."] },
  { title: 'Ash & Ivory', lines: ['You like black.', 'I like watching you in it.', 'You like quiet.', 'I like holding it alongside you.', 'You are ash and ivory.', 'You are the whole palette.'] },
  { title: 'Constant',    lines: ['Other things move.', 'Moods shift. Plans collapse.', 'Days arrive and refuse to behave.', 'But you — you are the one', 'fixed coordinate', 'by which I navigate everything.'] },
]
function PoemsApp() {
  const [p, setP] = useState(0)
  return (
    <div style={{ height: '100%', display: 'flex', background: 'var(--cream)' }}>
      <div style={{ width: 144, borderRight: '1px solid rgba(26,26,26,0.1)', overflowY: 'auto', flexShrink: 0 }}>
        {POEMS.map((poem, i) => (
          <button key={i} onClick={() => setP(i)}
            style={{ width: '100%', textAlign: 'left', padding: '16px', borderBottom: '1px solid rgba(26,26,26,0.08)',
              background: i === p ? 'var(--beige)' : 'transparent', border: 'none', cursor: 'pointer', display: 'block' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.3em', color: 'var(--ash-deep)', marginBottom: 4 }}>{String(i+1).padStart(2,'0')}</div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#1a1a1a' }}>{poem.title}</div>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div key={p} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ textAlign: 'center', maxWidth: 280 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 24 }}>Poem {String(p+1).padStart(2,'0')}</div>
          <h2 className="display" style={{ fontSize: 28, fontStyle: 'italic', color: '#1a1a1a', marginBottom: 32 }}>{POEMS[p].title}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {POEMS[p].lines.map((line, i) => (
              <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.09 }}
                style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: '#2a2a2a', lineHeight: 1.6 }}>{line}</motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Notes ────────────────────────────────────────────────────────────────────
const REASONS = [
  'The way you carry yourself — always like you know exactly who you are.',
  'How black looks on you like it was invented for you specifically.',
  "The quiet moments. You're never just filling silence.",
  'Your laugh when something catches you completely off-guard.',
  'That you like things that last — quality over quantity, always.',
  'The way you think before you speak. It means the words matter.',
  'How you make every room feel like somewhere worth staying.',
  'That you are both soft and sure at the same time.',
  'The way you remember small things other people forget.',
  'You. Just all of you. The whole complicated, beautiful thing.',
]
function NotesApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f9f5e8', padding: 28 }}>
      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 20 }}>Notes — Reasons I Love You</div>
      {REASONS.map((r, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
          style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
          <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', marginTop: 2, width: 20, flexShrink: 0 }}>{String(i+1).padStart(2,'0')}</span>
          <span style={{ fontSize: 13, lineHeight: 1.7, color: '#1a1a1a', fontFamily: 'var(--font-display)' }}>{r}</span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Memory Game ──────────────────────────────────────────────────────────────
const EMOJIS = ['🌙','⭐','🌸','💫','🌊','🍂','🕊️','🌿']
const shuffle = () => [...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, face: false, matched: false })).sort(() => Math.random() - 0.5)
function GameApp() {
  const [cards, setCards] = useState(shuffle)
  const [sel, setSel] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [lock, setLock] = useState(false)
  const won = cards.every(c => c.matched)
  const flip = (id: number) => {
    if (lock) return
    const card = cards.find(c => c.id === id)
    if (!card || card.matched || card.face || sel.length >= 2) return
    const nc = cards.map(c => c.id === id ? { ...c, face: true } : c)
    setCards(nc)
    const ns = [...sel, id]
    setSel(ns)
    if (ns.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = ns.map(sid => nc.find(c => c.id === sid)!)
      if (a.emoji === b.emoji) { setCards(prev => prev.map(c => ns.includes(c.id) ? { ...c, matched: true } : c)); setSel([]) }
      else { setLock(true); setTimeout(() => { setCards(prev => prev.map(c => ns.includes(c.id) && !c.matched ? { ...c, face: false } : c)); setSel([]); setLock(false) }, 850) }
    }
  }
  return (
    <div style={{ height: '100%', background: '#111', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.4em' }}>Moves: {moves}</span>
        <button onClick={() => { setCards(shuffle()); setSel([]); setMoves(0); setLock(false) }}
          style={{ background: 'none', border: 'none', color: 'var(--ash-deep)', cursor: 'pointer' }}><RefreshCw size={13} /></button>
      </div>
      {won && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--ash)' }}>Perfect — in {moves} moves.</div>
        </motion.div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {cards.map(c => (
          <button key={c.id} onClick={() => flip(c.id)}
            style={{ width: 56, height: 56, borderRadius: 12, border: `1px solid ${c.matched ? 'rgba(183,175,160,0.3)' : c.face ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
              background: c.matched ? 'rgba(183,175,160,0.06)' : c.face ? '#1e1e1e' : '#161616',
              cursor: 'pointer', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: c.matched ? 0.7 : 1, transition: 'all 0.3s' }}>
            {(c.face || c.matched) ? c.emoji : ''}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Map ──────────────────────────────────────────────────────────────────────
const PLACES = [
  { name: 'Lagos',     country: 'Nigeria',  status: 'home',    emoji: '🏠', note: 'Where it all begins.' },
  { name: 'Paris',     country: 'France',   status: 'dream',   emoji: '🗼', note: 'One day, Eiffel-lit.' },
  { name: 'Santorini', country: 'Greece',   status: 'dream',   emoji: '⛵', note: 'White walls, blue doors.' },
  { name: 'Kyoto',     country: 'Japan',    status: 'dream',   emoji: '🌸', note: 'Cherry blossoms, together.' },
  { name: 'Maldives',  country: 'Maldives', status: 'dream',   emoji: '🏝️', note: 'Overwater. No plans.' },
  { name: 'Marrakesh', country: 'Morocco',  status: 'dream',   emoji: '🕌', note: 'Colour and spice.' },
  { name: 'London',    country: 'UK',       status: 'someday', emoji: '🎡', note: 'Grey skies, warm inside.' },
  { name: 'New York',  country: 'USA',      status: 'someday', emoji: '🗽', note: 'The city that never stops.' },
  { name: 'Dubai',     country: 'UAE',      status: 'someday', emoji: '🌆', note: 'Too big, too bright.' },
  { name: 'Lisbon',    country: 'Portugal', status: 'someday', emoji: '🌊', note: 'Tiles and hills.' },
]
const SL: Record<string, string> = { home: 'Where We Are', dream: 'Dream Destinations', someday: 'On the List' }
function MapApp() {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: 'var(--ivory)', padding: 28 }}>
      <p style={{ fontSize: 10, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5em', color: 'var(--ash-deep)', marginBottom: 24 }}>Our World — Places to Go</p>
      {(['home', 'dream', 'someday'] as const).map(g => (
        <div key={g} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.45em', color: 'var(--ash-deep)', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid rgba(26,26,26,0.1)' }}>{SL[g]}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {PLACES.filter(p => p.status === g).map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(150,140,125,0.06)', border: '1px solid rgba(26,26,26,0.06)' }}>
                <span style={{ fontSize: 20 }}>{p.emoji}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: '#1a1a1a', fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{p.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const APP_MAP: Record<AppId, React.ComponentType> = {
  gallery: GalleryApp, cinema: CinemaApp, letter: LetterApp,
  timeline: TimelineApp, playlist: PlaylistApp, dreams: DreamsApp,
  about: AboutApp, terminal: TerminalApp, calendar: CalendarApp,
  journal: JournalApp, poems: PoemsApp, notes: NotesApp,
  game: GameApp, map: MapApp,
}

// ══════════════════════════════════════════════════════════════════════════════
//  MASCOTS
// ══════════════════════════════════════════════════════════════════════════════
const ASH_MSGS = ["She's beautiful, isn't she? 🤍", 'You built something lovely for her.', 'This archive will never forget.', 'She deserves this and so much more.', 'Every frame here is true.', 'Come back often. So will she.']
function MascotAsh() {
  const [msgIdx, setMsgIdx] = useState(0)
  const [showMsg, setShowMsg] = useState(false)
  const [blink, setBlink] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const blinker = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150) }, 2800 + Math.random() * 2000)
    return () => clearInterval(blinker)
  }, [])
  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMsgIdx(i => (i + 1) % ASH_MSGS.length); setShowMsg(true)
    timerRef.current = setTimeout(() => setShowMsg(false), 3200)
  }
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={handleClick}>
      <AnimatePresence>
        {showMsg && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
            style={{ position: 'absolute', bottom: '100%', marginBottom: 12, left: '50%', transform: 'translateX(-50%)',
              background: '#f5f0e8', border: '1px solid rgba(26,26,26,0.12)', borderRadius: 12, padding: '8px 12px',
              fontSize: 10, fontFamily: 'var(--font-mono)', color: '#1a1a1a', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 9999 }}>
            {ASH_MSGS[msgIdx]}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
          <ellipse cx="26" cy="30" rx="18" ry="22" fill="#f0ece4" />
          <path d="M14 48 Q8 56 14 62 Q18 58 22 62 Q24 56 20 50" fill="#f0ece4" opacity="0.7" />
          <path d="M38 48 Q44 56 38 62 Q34 58 30 62 Q28 56 32 50" fill="#f0ece4" opacity="0.5" />
          {blink ? (<><line x1="19" y1="26" x2="23" y2="26" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/><line x1="29" y1="26" x2="33" y2="26" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/></>) : (<><circle cx="21" cy="26" r="2.5" fill="#1a1a1a"/><circle cx="31" cy="26" r="2.5" fill="#1a1a1a"/><circle cx="22" cy="25" r="0.8" fill="white"/><circle cx="32" cy="25" r="0.8" fill="white"/></>)}
          <ellipse cx="17" cy="31" rx="4" ry="2.5" fill="#d4c8b8" opacity="0.5" />
          <ellipse cx="35" cy="31" rx="4" ry="2.5" fill="#d4c8b8" opacity="0.5" />
          <path d="M22 33 Q26 36 30 33" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
      </motion.div>
      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', marginTop: 4 }}>Ash</span>
    </div>
  )
}

const IVORY_MSGS = ["Prrr... she's your favourite, hm? 🐾", 'I guard this archive. Always.', 'The gallery has her best angles. *stretches*', "Click something. She'd love it.", '*yawns* Still here. Still watching.', 'Meow means I approve. I approve.']
function MascotIvory() {
  const [msgIdx, setMsgIdx] = useState(0)
  const [showMsg, setShowMsg] = useState(false)
  const [blink, setBlink] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    const blinker = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 120) }, 3500 + Math.random() * 2500)
    return () => clearInterval(blinker)
  }, [])
  const handleClick = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setMsgIdx(i => (i + 1) % IVORY_MSGS.length); setShowMsg(true)
    timerRef.current = setTimeout(() => setShowMsg(false), 3200)
  }
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }} onClick={handleClick}>
      <AnimatePresence>
        {showMsg && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4, scale: 0.95 }}
            style={{ position: 'absolute', bottom: '100%', marginBottom: 12, left: '50%', transform: 'translateX(-50%)',
              background: '#f5f0e8', border: '1px solid rgba(26,26,26,0.12)', borderRadius: 12, padding: '8px 12px',
              fontSize: 10, fontFamily: 'var(--font-mono)', color: '#1a1a1a', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 9999 }}>
            {IVORY_MSGS[msgIdx]}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}>
        <svg width="56" height="70" viewBox="0 0 56 70" fill="none">
          <rect x="12" y="28" width="32" height="28" rx="10" fill="#e8e4dc"/>
          <ellipse cx="28" cy="22" rx="15" ry="14" fill="#e8e4dc"/>
          <polygon points="14,12 10,0 22,10" fill="#e8e4dc"/><polygon points="15,11 12,3 21,10" fill="#c8c0b4"/>
          <polygon points="42,12 46,0 34,10" fill="#e8e4dc"/><polygon points="41,11 44,3 35,10" fill="#c8c0b4"/>
          {blink ? (<><line x1="21" y1="21" x2="25" y2="21" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/><line x1="31" y1="21" x2="35" y2="21" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/></>) : (<><ellipse cx="23" cy="21" rx="3.5" ry="3" fill="#1c1c1c"/><ellipse cx="33" cy="21" rx="3.5" ry="3" fill="#1c1c1c"/><circle cx="24" cy="20" r="1" fill="white"/><circle cx="34" cy="20" r="1" fill="white"/></>)}
          <path d="M27 25 L28 26.5 L29 25 Z" fill="#b8aca0"/>
          <line x1="10" y1="24" x2="22" y2="25.5" stroke="#b8aca0" strokeWidth="0.8" opacity="0.7"/>
          <line x1="10" y1="27" x2="22" y2="27" stroke="#b8aca0" strokeWidth="0.8" opacity="0.5"/>
          <line x1="46" y1="24" x2="34" y2="25.5" stroke="#b8aca0" strokeWidth="0.8" opacity="0.7"/>
          <line x1="46" y1="27" x2="34" y2="27" stroke="#b8aca0" strokeWidth="0.8" opacity="0.5"/>
          <ellipse cx="20" cy="56" rx="5" ry="3.5" fill="#ddd8d0"/>
          <ellipse cx="36" cy="56" rx="5" ry="3.5" fill="#ddd8d0"/>
          <motion.path d="M44 50 Q52 42 50 32 Q48 24 54 18" stroke="#e8e4dc" strokeWidth="5" strokeLinecap="round" fill="none"
            animate={{ d: ['M44 50 Q52 42 50 32 Q48 24 54 18', 'M44 50 Q50 38 44 28 Q40 20 46 12', 'M44 50 Q52 42 50 32 Q48 24 54 18'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}/>
          <ellipse cx="28" cy="36" rx="7" ry="5" fill="#f0ece6" opacity="0.8"/>
        </svg>
      </motion.div>
      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', marginTop: 4 }}>Ivory</span>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  OS CHROME
// ══════════════════════════════════════════════════════════════════════════════
function Menubar({ openApp }: { openApp(id: AppId): void }) {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  const fmt = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dfmt = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
  const NAV: AppId[] = ['gallery', 'letter', 'playlist', 'dreams', 'poems']
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, height: 32,
      background: 'rgba(13,13,13,0.96)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--ash)', letterSpacing: '0.05em', marginRight: 4 }}>◆ For Her</span>
      <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--ash-deep)' }}>
        {NAV.map(id => (
          <button key={id} onClick={() => openApp(id)}
            style={{ background: 'none', border: 'none', color: 'var(--ash-deep)', cursor: 'pointer',
              fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', fontFamily: 'var(--font-mono)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ash)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ash-deep)')}>
            {id}
          </button>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16, color: 'var(--ash-deep)' }}>
        <span style={{ fontSize: 9, letterSpacing: '0.15em' }}>{dfmt}</span>
        <span style={{ color: 'var(--ash)', letterSpacing: '0.15em' }}>{fmt}</span>
      </div>
    </div>
  )
}

function Dock({ wins, openApp }: { wins: Win[]; openApp(id: AppId): void }) {
  return (
    <div style={{ position: 'fixed', bottom: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 9998,
      display: 'flex', alignItems: 'flex-end', gap: 4, padding: '8px 12px', borderRadius: 16,
      background: 'rgba(20,20,20,0.82)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      {APPS.map(app => {
        const isOpen = wins.some(w => w.app === app.id)
        return (
          <div key={app.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            title={app.label}>
            <motion.button onClick={() => openApp(app.id as AppId)}
              whileHover={{ scale: 1.18, y: -4 }} whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer',
                background: isOpen ? '#2a2a2a' : '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <app.Icon size={19} color={isOpen ? 'var(--ash)' : 'var(--ash-deep)'} />
            </motion.button>
            {isOpen && <div style={{ position: 'absolute', bottom: -6, width: 5, height: 5, borderRadius: '50%', background: 'var(--ash)' }} />}
          </div>
        )
      })}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN DESKTOP
// ══════════════════════════════════════════════════════════════════════════════
export default function Desktop() {
  const { wins, open, close, focus, minimize, maximize, move } = useWM()
  const [booted, setBooted] = useState(false)
  const [bootPct, setBootPct] = useState(0)

  useEffect(() => {
    const steps = [15, 35, 55, 75, 90, 100]; let i = 0
    const iv = setInterval(() => { if (i < steps.length) { setBootPct(steps[i]); i++ } }, 260)
    const to = setTimeout(() => { clearInterval(iv); setBooted(true) }, 1900)
    return () => { clearInterval(iv); clearTimeout(to) }
  }, [])

  useEffect(() => {
    if (!booted) return
    const t = setTimeout(() => open('letter'), 700)
    return () => clearTimeout(t)
  }, [booted, open])

  return (
    <>
      {/* Boot screen */}
      <AnimatePresence>
        {!booted && (
          <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
            style={{ position: 'fixed', inset: 0, zIndex: 99999, background: '#080808',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="display" style={{ fontSize: 28, fontStyle: 'italic', color: 'var(--ash)' }}>for her.</motion.div>
            <div style={{ width: 208, height: 1, background: '#1e1e1e', position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
              <motion.div style={{ position: 'absolute', inset: '0 auto 0 0', background: 'var(--ash)' }}
                animate={{ width: `${bootPct}%` }} transition={{ duration: 0.28 }} />
            </div>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ash-deep)', textTransform: 'uppercase', letterSpacing: '0.55em' }}>Loading archive...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop */}
      <AnimatePresence>
        {booted && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.9 }}
            style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#080808' }}>
            {/* Wallpaper */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <img src="/media/photos/p3.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.11, filter: 'grayscale(100%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,8,8,0.85) 0%, rgba(8,8,8,0.6) 50%, rgba(8,8,8,0.92) 100%)' }} />
            </div>
            {/* Hint */}
            <div style={{ position: 'absolute', bottom: 96, right: 32, textAlign: 'right', pointerEvents: 'none' }}>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.07)', textTransform: 'uppercase', letterSpacing: '0.45em', lineHeight: 2 }}>Click any icon</div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.07)', textTransform: 'uppercase', letterSpacing: '0.45em' }}>in the dock below</div>
            </div>
            {/* Mascots */}
            <div style={{ position: 'fixed', bottom: 88, left: 24, zIndex: 9997, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
              <MascotAsh /><MascotIvory />
            </div>
            {/* Windows */}
            <AnimatePresence>
              {wins.map(win => {
                const App = APP_MAP[win.app]
                return (
                  <OSWindow key={win.id} win={win}
                    onClose={() => close(win.id)} onMinimize={() => minimize(win.id)}
                    onMaximize={() => maximize(win.id)} onFocus={() => focus(win.id)}
                    onMove={(x, y) => move(win.id, x, y)}>
                    <App />
                  </OSWindow>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chrome */}
      {booted && <><Menubar openApp={open} /><Dock wins={wins} openApp={open} /></>}
    </>
  )
}
