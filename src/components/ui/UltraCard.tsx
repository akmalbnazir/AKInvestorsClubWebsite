"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
export default function UltraCard({ children, className }: { children: React.ReactNode; className?: string }){
  const ref = useRef<HTMLDivElement>(null);
  const onMouseMove = (e: React.MouseEvent) => {
    const el = ref.current!; const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -8; const ry = ((x / rect.width) - 0.5) * 8;
    el.style.setProperty("--rx", `${rx}deg`); el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--px", `${x}px`); el.style.setProperty("--py", `${y}px`);
  };
  const onLeave = () => { const el = ref.current!; el.style.setProperty("--rx", `0deg`); el.style.setProperty("--ry", `0deg`); };
  return (
    <motion.div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onLeave}
      whileHover={{ scale: 1.02 }} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "tween", duration: 0.5 }}
      className={`card [transform:perspective(600px)_rotateX(var(--rx))_rotateY(var(--ry))] ${className||""}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl"
           style={{ background: "radial-gradient(220px 220px at var(--px) var(--py), rgba(0,255,136,0.18), transparent)" }} />
      {children}
    </motion.div>
  );
}
