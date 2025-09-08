"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { useFXBus } from "store/useFXBus";

type Sess = { role: string } | null;

const BASE = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Join", href: "/join" },
];

const ADMIN_ROLES = ["PRESIDENT", "EXEC_TECH", "EXEC_OUTREACH", "ADMIN"];

export default function MorphDock({ session }: { session: Sess }) {
  const router = useRouter();
  const [pulse, setPulse] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const inactivityTimer = useRef<number | null>(null);

  const addBurst = useFXBus((s) => s.addBurst);
  const addWave = useFXBus((s) => s.addWave);

  // Build items list
  const items = [...BASE];
  if (session) {
    items.push({ label: "Learn", href: "/learn" });
    items.push({ label: "Forum", href: "/forum" });
    items.push({ label: "Simulator", href: "/simulator" });
    items.push({ label: "Course", href: "/course" });
    items.push({ label: "Tools", href: "/tools" });
    if (ADMIN_ROLES.includes(session.role)) {
      items.push({ label: "Admin", href: "/admin" });
    }
    items.push({ label: "Logout", href: "/api/auth/logout" });
  } else {
    items.push({ label: "Sign In", href: "/signin" });
  }

  const go = (idx: number, href: string) => {
    setPulse(idx);
    setTransitioning(true);
    const x = window.innerWidth / 2;
    const y = window.innerHeight - 40;
    addBurst(x, y);
    addWave(x, y);

    if (href.startsWith("/api/auth/logout")) {
      fetch(href, { method: "POST" })
        .then(() => (window.location.href = "/"))
        .catch(() => (window.location.href = "/"));
      return;
    }
    setTimeout(() => router.push(href), 120);
    setTimeout(() => setTransitioning(false), 900);
  };

  // Dock spacing (pushes content up when open)
  const dockRef = useRef<HTMLDivElement | null>(null);
  const applyDockSpace = useCallback(() => {
    const el = dockRef.current;
    const root = document.documentElement;
    if (!el || !open) {
      root.style.setProperty("--dock-space", "0px");
      return;
    }
    root.style.setProperty(
      "--dock-space",
      `${el.getBoundingClientRect().height + 16}px`
    );
  }, [open]);

  useEffect(() => {
    applyDockSpace();
    if (!dockRef.current) return;
    const ro = new ResizeObserver(applyDockSpace);
    ro.observe(dockRef.current);
    window.addEventListener("resize", applyDockSpace);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", applyDockSpace);
    };
  }, [applyDockSpace]);

  // Reveal dock when mouse moves near bottom
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (open) return;
      const nearBottom = window.innerHeight - e.clientY <= 48;
      if (nearBottom) setOpen(true);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [open]);

  const scheduleHide = useCallback((ms = 420) => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), ms);
  }, []);
  const cancelHide = useCallback(() => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = null;
  }, []);

  const onAnyInteraction = () => {
    if (!open) return;
    if (inactivityTimer.current) window.clearTimeout(inactivityTimer.current);
    inactivityTimer.current = window.setTimeout(() => setOpen(false), 3500);
  };
  const onFocusWithin = () => cancelHide();
  const onBlurWithin = () => scheduleHide(800);

  return (
    <>
      {/* bottom reveal zone (desktop) */}
      <div
        className="fixed inset-x-0 bottom-0 h-12 z-30 pointer-events-none md:pointer-events-auto"
        onMouseEnter={() => setOpen(true)}
      />

      {/* Pill button when dock is closed */}
      <AnimatePresence>
        {!open && (
          <div className="fixed bottom-1.5 inset-x-0 z-[41] flex justify-center pointer-events-none">
            <motion.button
              key="menu-pill"
              aria-label="Open navigation"
              onClick={() => {
                setOpen(true);
                cancelHide();
                onAnyInteraction();
              }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="pointer-events-auto rounded-full px-4 py-1 text-xs bg-black/60 border border-emerald-400/30 shadow-neon text-ak-text/90"
            >
              ▲ Menu
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Dock */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="dock"
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-4 inset-x-0 z-40 px-2"
            onMouseEnter={cancelHide}
            onMouseLeave={() => scheduleHide(420)}
            onFocusCapture={onFocusWithin}
            onBlurCapture={onBlurWithin}
            onPointerMove={onAnyInteraction}
            onTouchStart={onAnyInteraction}
            ref={dockRef}
          >
            <motion.div
              layout
              className="mx-auto w-[min(100vw-16px,1200px)] backdrop-blur bg-black/60 border border-emerald-400/30 rounded-2xl px-2 py-2 shadow-neon flex flex-wrap gap-2 justify-center"
            >
              {items.map((it, i) => (
                <motion.button
                  key={`${it.href}-${it.label}`}
                  onClick={() => go(i, it.href)}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.96, rotate: -2 }}
                  animate={
                    pulse === i
                      ? { boxShadow: "0 0 30px rgba(0,255,136,0.6)" }
                      : {}
                  }
                  className="px-4 py-2 rounded-xl neon-border text-sm whitespace-nowrap"
                >
                  {it.label}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* route-change burst */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 50, opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-none fixed left-1/2 bottom-6 z-30 h-16 w-16 -translate-x-1/2 rounded-full bg-ak-neon"
          />
        )}
      </AnimatePresence>
    </>
  );
}
