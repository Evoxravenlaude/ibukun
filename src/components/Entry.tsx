import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'

export default function Entry() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => { setUrl(window.location.origin + '/home') }, [])

  const enter = () => {
    setUnlocking(true)
    sessionStorage.setItem('entered', '1')
    setTimeout(() => navigate('/home'), 1100)
  }

  return (
    <div className="grain" style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'var(--noir)', color: 'oklch(0.92 0.005 90)' }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.07,
        backgroundImage: 'linear-gradient(var(--ash) 1px, transparent 1px), linear-gradient(90deg, var(--ash) 1px, transparent 1px)',
        backgroundSize: '80px 80px' }} />
      {/* Radial veil */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at top, oklch(0.18 0.003 90) 0%, oklch(0.05 0 0) 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: unlocking ? 0 : 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative', zIndex: 10, maxWidth: 1152, margin: '0 auto',
          display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '40px 32px' }}
      >
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', fontFamily: 'var(--font-mono)' }}>
          <span>Archive 001</span>
          <span>Private · Encoded</span>
          <span>{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}</span>
        </header>

        {/* Main */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 56, textAlign: 'center' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.4 }}>
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5em',
              color: 'var(--ash-deep)', fontFamily: 'var(--font-mono)', marginBottom: 24 }}>
              ⸻ Entry by invitation only ⸻
            </p>
            <h1 className="display" style={{ fontSize: 'clamp(64px, 12vw, 128px)', lineHeight: 0.95, marginBottom: 24 }}>
              <span style={{ fontStyle: 'italic', color: 'var(--ash)' }}>for</span> her.
            </h1>
            <p style={{ maxWidth: 400, fontSize: 14, lineHeight: 1.8, color: 'var(--ash-deep)', margin: '0 auto' }}>
              A world built on the bricks of love. Quiet, soft, and entirely yours.
              Scan to enter, or tap the cipher below.
            </p>
          </motion.div>

          {/* QR */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}>
            <div style={{ position: 'relative', display: 'inline-block', borderRadius: 2,
              background: 'oklch(0.95 0 0)', padding: 24,
              boxShadow: '0 40px 120px -20px oklch(0 0 0 / 0.8)' }}>
              {url && <QRCodeSVG value={url} size={200} bgColor="#f2f0ec" fgColor="#0a0a0a" level="H" marginSize={0} />}
              <div style={{ position: 'absolute', inset: -1, border: 'none', borderRadius: 2 }} />
            </div>
            <p style={{ marginTop: 20, fontSize: 10, textTransform: 'uppercase',
              letterSpacing: '0.4em', color: 'var(--ash-deep)', fontFamily: 'var(--font-mono)' }}>
              Scan · or ·
            </p>
          </motion.div>

          {/* Unlock button */}
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 1 }}
            onClick={enter}
            style={{ position: 'relative', overflow: 'hidden', border: '1px solid oklch(0.72 0.008 85 / 0.4)',
              padding: '16px 48px', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.4em',
              color: 'var(--ash)', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--font-mono)' }}
            whileHover="hover"
          >
            <motion.span style={{ position: 'absolute', inset: 0, background: 'var(--ash)', translateY: '-100%' }}
              variants={{ hover: { translateY: '0%' } }} transition={{ duration: 0.5 }} />
            <motion.span style={{ position: 'relative', zIndex: 1 }}
              variants={{ hover: { color: 'var(--noir)' } }}>
              Unlock the archive
            </motion.span>
          </motion.button>
        </main>

        {/* Footer */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10,
          textTransform: 'uppercase', letterSpacing: '0.4em', color: 'var(--ash-deep)', fontFamily: 'var(--font-mono)' }}>
          <span>Cipher · 0x00A5H</span><span>·</span><span>Made by hand</span>
        </footer>
      </motion.div>

      {/* Wipe transition */}
      {unlocking && (
        <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: [0.83, 0, 0.17, 1] }}
          style={{ position: 'fixed', inset: 0, zIndex: 50, originY: 1, background: 'var(--noir)' }} />
      )}
    </div>
  )
}
