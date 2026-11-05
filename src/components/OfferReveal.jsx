import { LazyMotion, domAnimation, m, useReducedMotion } from "framer-motion";

export default function OfferReveal({ children }) {
  const reduced = useReducedMotion();
  return <LazyMotion features={domAnimation} strict>
    <m.div initial={reduced ? false : { opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}>{children}</m.div>
  </LazyMotion>;
}
