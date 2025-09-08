"use client";
import useSWR from "swr";
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function EventCalendar() {
  const { data } = useSWR("/api/events", fetcher, { revalidateOnFocus: false });
  const items = data || [];
  return (
    <div className="space-y-3">
      {items.map((e: any) => (
        <div key={e.id} className="p-3 rounded-lg bg-black/40 border border-emerald-400/20">
          <div className="font-semibold">{e.title}</div>
          <div className="text-sm text-ak-sub">
            {new Date(e.date).toLocaleString()} • {e.location}
          </div>
          <div className="text-sm mt-1">{e.details}</div>
        </div>
      ))}
      {items.length === 0 && <div className="text-ak-sub/70 text-sm">No upcoming events.</div>}
    </div>
  );
}
