import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/_inside/gallery")({
  head: () => ({ meta: [{ title: "Gallery — For Her" }] }),
  component: Gallery,
});

const PHOTOS = [
  { src: "/media/photos/p1.jpg", caption: "Neon hush", span: "row-span-2" },
  { src: "/media/photos/p2.jpg", caption: "Slow afternoon" },
  { src: "/media/photos/p3.jpg", caption: "Stay close" },
  { src: "/media/photos/p4.jpg", caption: "That smile" },
  { src: "/media/photos/p5.jpg", caption: "Soft world", span: "row-span-2" },
  { src: "/media/photos/p6.jpg", caption: "Sunlit" },
];

function Gallery() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-ash-deep font-mono mb-4">02 · Gallery</p>
          <h1 className="font-display text-6xl md:text-8xl">Frames<span className="italic text-ash"> of you</span>.</h1>
        </div>
        <p className="max-w-sm text-sm text-ash-deep">Hover to color. Click to hold a frame. Each one is a memory I refuse to forget.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[260px] gap-3">
        {PHOTOS.map((p, i) => (
          <motion.button
            key={p.src}
            onClick={() => setOpen(p.src)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className={`group relative overflow-hidden ${p.span ?? ""}`}
          >
            <img src={p.src} alt={p.caption} className="h-full w-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 text-left">
              <div className="text-[9px] uppercase tracking-[0.3em] text-ash-deep font-mono">{String(i + 1).padStart(2, "0")}</div>
              <div className="text-sm text-foreground font-display italic">{p.caption}</div>
            </div>
          </motion.button>
        ))}
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setOpen(null)}
          className="fixed inset-0 z-50 bg-noir/95 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out"
        >
          <motion.img
            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
            src={open} alt="" className="max-h-full max-w-full object-contain"
          />
        </motion.div>
      )}
    </div>
  );
}
