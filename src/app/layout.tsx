import "./globals.css";
import type { Metadata } from "next";
import GlobalFX from "components/fx/GlobalFX";
import MorphDockWrapper from "components/layout/MorphDockWrapper";
import TickerBar from "components/hud/TickerBar";

export const metadata: Metadata = {
  title: "AK Investment Club",
  description: "Ardrey Kell Investment Club — Simulator, Courses, Events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-display bg-ak-bg">
        <GlobalFX />
        <TickerBar />
        <main className="relative min-h-screen z-10 grid place-items-center px-4">{children}</main>
        <MorphDockWrapper />
      </body>
    </html>
  );
}
