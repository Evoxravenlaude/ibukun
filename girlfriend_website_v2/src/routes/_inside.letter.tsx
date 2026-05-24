import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_inside/letter")({
  head: () => ({ meta: [{ title: "Letter — For Her" }] }),
  component: Letter,
});

function Letter() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
      >
        <p className="text-[11px] uppercase tracking-[0.5em] text-ash-deep font-mono mb-6">04 · A letter</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[1.05]">
          To the girl<br/><span className="italic text-ash">who painted my world</span><br/>in black and ash.
        </h1>
      </motion.div>

      <div className="mt-16 space-y-8 text-base md:text-lg leading-[1.9] text-ash font-display">
        {[
          "I'm not a poet. I never was. But every time I think of you, language starts to behave like one — softer, slower, careful with its weight.",
          "You like black. You like ash. Two colors most people overlook because they think there's nothing inside them. But I've seen what lives there — depth, warmth, the kind of quiet that holds you instead of leaving you alone.",
          "That's you. Quiet, but never empty. Soft, but never small.",
          "I built this little corner of the internet because flowers wilt and chocolates run out, but pixels — pixels can stay exactly where I put them, holding the shape of how I feel.",
          "Scroll back whenever you forget. It will always be here. So will I.",
        ].map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.15 }}
          >
            {p}
          </motion.p>
        ))}

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="pt-12 border-t border-border"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-ash-deep">Signed, with everything I have —</p>
          <p className="font-display text-5xl italic mt-4 text-foreground">yours.</p>
        </motion.div>
      </div>
    </div>
  );
}
