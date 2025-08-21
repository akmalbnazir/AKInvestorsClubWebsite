import UltraCard from "components/ui/UltraCard";
import Bulletin from "components/widgets/Bulletin";
import EventCalendar from "components/widgets/EventCalendar";

export default function HomePage() {
  return (
    <section className="relative w-full max-w-5xl mx-auto space-y-6">
      <UltraCard className="text-center">
        <div className="text-sm text-ak-sub mb-2">Bulletin Board</div>
        <Bulletin />
      </UltraCard>

      <UltraCard className="text-center p-10 md:p-14">
        <h1 className="text-4xl md:text-6xl font-extrabold">AK Investment Club</h1>
        <p className="text-ak-sub mt-3">Live tickers • real-time FX • mini-LMS • leaderboards • zero dead space.</p>
        <div className="flex gap-3 mt-6 justify-center">
          <a href="/join" className="px-5 py-3 rounded-xl bg-ak-neon text-black font-semibold">Join the club</a>
          <a href="/about" className="px-5 py-3 rounded-xl neon-border">Explore</a>
        </div>
      </UltraCard>

      <UltraCard className="p-6">
        <div className="text-sm text-ak-sub mb-4">Upcoming Events</div>
        <EventCalendar />
      </UltraCard>
    </section>
  );
}
