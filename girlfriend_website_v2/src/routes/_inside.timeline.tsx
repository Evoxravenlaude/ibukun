import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_inside/timeline")({
  head: () => ({ meta: [{ title: "Timeline — For Her" }] }),
  component: Timeline,
});

const ENTRIES = [
  { tag: "First", title: "The moment I noticed.", body: "Not the day we met — the day I realized I was already in trouble.", img: "/media/photos/p5.jpg" },
  { tag: "Soft", title: "Late-night neon.", body: "You laughed at something I can't even remember. The lighting did the rest.", img: "/media/photos/p1.jpg" },
  { tag: "Close", title: "Lazy mornings.", body: "Pillows, sunlight through curtains, you making a face only I get to see.", img: "/media/photos/p2.jpg" },
  { tag: "Home", title: "Just us.", body: "Two people, one couch, no plans. Maybe the best version of life.", img: "/media/photos/p4.jpg" },
  { tag: "Now", title: "Today.", body: "Still here. Still chasing the same smile.", img: "/media/photos/p6.jpg" },
];

function Timeline() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-20">
        <p className="text-[11px] uppercase tracking-[0.5em] text-ash-deep font-mono mb-4">05 · Timeline</p>
        <h1 className="font-display text-6xl md:text-8xl">Marks<span className="italic text-ash"> in time</span>.</h1>
      </div>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
        <div className="space-y-24">
          {ENTRIES.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
              className={`relative grid md:grid-cols-2 gap-8 items-center ${i % 2 ? "md:[direction:rtl]" : ""}`}
            >
              <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-ash -translate-x-1/2 ring-4 ring-noir" />
              <div className="pl-12 md:pl-0 md:px-12 [direction:ltr]">
                <div className="text-[10px] uppercase tracking-[0.4em] text-ash-deep font-mono mb-3">{String(i + 1).padStart(2, "0")} · {e.tag}</div>
                <h3 className="font-display text-4xl md:text-5xl mb-4 leading-tight">{e.title}</h3>
                <p className="text-sm text-ash-deep leading-relaxed max-w-md">{e.body}</p>
              </div>
              <div className="pl-12 md:pl-0 md:px-12 [direction:ltr]">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={e.img} alt="" className="h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-700" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
