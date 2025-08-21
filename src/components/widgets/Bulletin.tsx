"use client";
import useSWR from "swr";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function Bulletin() {
  const { data } = useSWR("/api/bulletin", fetcher, { revalidateOnFocus: false });
  const items = data || [];
  return (
    <div className="space-y-2">
      {items.map((b: any) => (
        <div key={b.id} className="text-sm text-ak-sub">
          {new Date(b.createdAt).toLocaleString()} — {b.message}
        </div>
      ))}
      {items.length === 0 && <div className="text-ak-sub/70 text-sm">No messages yet.</div>}
    </div>
  );
}
