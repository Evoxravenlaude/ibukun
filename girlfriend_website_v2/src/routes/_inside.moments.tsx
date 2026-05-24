import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_inside/moments")({
  head: () => ({ meta: [{ title: "Moments — For Her" }] }),
  component: Moments,
});

const VIDEOS = [
  { src: "/media/videos/v1.mp4", title: "Moment I", note: "Caught in motion." },
  { src: "/media/videos/v2.mp4", title: "Moment II", note: "The way you move." },
  { src: "/media/videos/v3.mp4", title: "Moment III", note: "Soft, unrehearsed." },
  { src: "/media/videos/v4.mp4", title: "Moment IV", note: "Replay forever." },
];

function Moments() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-16">
        <p className="text-[11px] uppercase tracking-[0.5em] text-ash-deep font-mono mb-4">03 · Moments</p>
        <h1 className="font-display text-6xl md:text-8xl">Living<span className="italic text-ash"> stills</span>.</h1>
        <p className="mt-6 max-w-md text-sm text-ash-deep">Tap any frame to play. Sound is yours to choose.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {VIDEOS.map((v, i) => (
          <motion.div
            key={v.src}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="group"
          >
            <div className="relative overflow-hidden bg-card aspect-[9/16] md:aspect-video">
              <video
                src={v.src}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.4em] text-ash-deep font-mono">{String(i + 1).padStart(2, "0")}</div>
                <div className="font-display text-2xl italic">{v.title}</div>
              </div>
              <div className="text-xs text-ash-deep">{v.note}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
