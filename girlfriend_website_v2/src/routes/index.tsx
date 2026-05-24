import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "For Her — A Private Archive" },
      { name: "description", content: "A private, hand-built world. Entry by invitation." },
    ],
  }),
  component: Entry,
});

function Entry() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + "/home");
  }, []);

  const enter = () => {
    setUnlocking(true);
    sessionStorage.setItem("entered", "1");
    setTimeout(() => navigate({ to: "/home" }), 1100);
  };

  return (
    <div className="grain relative min-h-screen overflow-hidden bg-noir text-foreground">
      <div className="absolute inset-0 bg-veil" />
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage:
          "linear-gradient(var(--ash) 1px, transparent 1px), linear-gradient(90deg, var(--ash) 1px, transparent 1px)",
          backgroundSize: "80px 80px" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: unlocking ? 0 : 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-8 py-10"
      >
        <header className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-ash-deep font-mono">
          <span>Archive 001</span>
          <span>Private · Encoded</span>
          <span>{new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" })}</span>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-14 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1.4 }}
            className="space-y-6"
          >
            <p className="text-[11px] uppercase tracking-[0.5em] text-ash-deep font-mono">
              ⸻ Entry by invitation only ⸻
            </p>
            <h1 className="text-7xl md:text-9xl font-display leading-[0.95]">
              <span className="italic text-ash">for</span> her.
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-ash-deep">
              A world built in black and ash. Quiet, soft, and entirely yours.
              Scan to enter, or tap the cipher below.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="relative"
          >
            <div className="relative rounded-sm bg-[oklch(0.95_0_0)] p-6 shadow-[0_40px_120px_-20px_oklch(0_0_0/0.8)]">
              {url && (
                <QRCodeSVG
                  value={url}
                  size={220}
                  bgColor="#f2f0ec"
                  fgColor="#0a0a0a"
                  level="H"
                  marginSize={0}
                />
              )}
              <div className="absolute -inset-px rounded-sm border border-ash/30" />
            </div>
            <p className="mt-5 text-[10px] uppercase tracking-[0.4em] text-ash-deep font-mono">
              Scan · or ·
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1 }}
            onClick={enter}
            className="group relative overflow-hidden border border-ash/40 px-12 py-4 text-xs uppercase tracking-[0.4em] text-ash transition-colors hover:text-noir font-mono"
          >
            <span className="relative z-10">Unlock the archive</span>
            <span className="absolute inset-0 -translate-y-full bg-ash transition-transform duration-500 group-hover:translate-y-0" />
          </motion.button>
        </main>

        <footer className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-ash-deep font-mono">
          <span>Cipher · 0x00A5H</span>
          <span>·</span>
          <span>Made by hand</span>
        </footer>
      </motion.div>

      {unlocking && (
        <motion.div
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, ease: [0.83, 0, 0.17, 1] }}
          className="absolute inset-0 z-50 origin-bottom bg-noir"
        />
      )}
    </div>
  );
}
