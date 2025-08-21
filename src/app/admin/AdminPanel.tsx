"use client";
import useSWR from "swr";
import { useState } from "react";
import UltraCard from "components/ui/UltraCard";
import Bulletin from "components/widgets/Bulletin";
import EventCalendar from "components/widgets/EventCalendar";

export default function AdminPanel() {
  return (
    <>
      <AdminBulletin />
      <AdminEvents />
      <AdminApprovals />
    </>
  );
}

function AdminBulletin() {
  const [msg,setMsg] = useState("");
  const { mutate } = useSWR("/api/admin/bulletin");
  const add = async()=>{ 
    if(!msg.trim()) return; 
    await fetch("/api/admin/bulletin",{method:"POST",body:JSON.stringify({message:msg})}); 
    setMsg(""); mutate(); 
  };
  return (
    <UltraCard>
      <div className="text-xl font-semibold mb-2">Bulletin</div>
      <div className="flex gap-2">
        <input className="flex-1 rounded-lg bg-black/40 p-3" placeholder="Message..." value={msg} onChange={e=>setMsg(e.target.value)} />
        <button onClick={add} className="px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">Add</button>
      </div>
      <div className="mt-4"><Bulletin/></div>
    </UltraCard>
  );
}

function AdminEvents() {
  const { data, mutate } = useSWR("/api/admin/events", (u)=>fetch(u).then(r=>r.json()));
  const [form,setForm] = useState({ title:"", date:"", location:"", details:"" });
  const add = async()=>{ 
    await fetch("/api/admin/events",{method:"POST",body:JSON.stringify(form)}); 
    setForm({ title:"", date:"", location:"", details:"" }); 
    mutate(); 
  };
  const del = async(id:string)=>{ await fetch(`/api/admin/events?id=${id}`,{method:"DELETE"}); mutate(); };
  return (
    <UltraCard>
      <div className="text-xl font-semibold mb-2">Events</div>
      <div className="grid md:grid-cols-4 gap-2">
        <input className="rounded-lg bg-black/40 p-3" placeholder="Title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} />
        <input className="rounded-lg bg-black/40 p-3" placeholder="Date (YYYY-MM-DD HH:MM)" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} />
        <input className="rounded-lg bg-black/40 p-3" placeholder="Location" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
        <input className="rounded-lg bg-black/40 p-3" placeholder="Details" value={form.details} onChange={e=>setForm({...form,details:e.target.value})} />
      </div>
      <button onClick={add} className="mt-3 px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">Add event</button>
      <div className="mt-4"><EventCalendar/></div>
      <div className="mt-4 grid gap-2">
        {(data||[]).map((e:any)=>(
          <div key={e.id} className="flex items-center gap-3">
            <div className="flex-1">{e.title} — {new Date(e.date).toLocaleString()}</div>
            <button onClick={()=>del(e.id)} className="text-red-300 underline">Delete</button>
          </div>
        ))}
      </div>
    </UltraCard>
  );
}

function AdminApprovals() {
  const { data, mutate } = useSWR("/api/admin/join-requests", (u)=>fetch(u).then(r=>r.json()));
  const approve = async (id:string)=>{
    const r = await fetch(`/api/admin/join-requests/${id}/approve`, { method:"POST" });
    const js = await r.json();
    alert(`Approved ${js.email}. Temp password: ${js.tempPassword}`);
    mutate();
  };
  return (
    <UltraCard>
      <div className="text-xl font-semibold mb-2">Join Requests</div>
      <div className="space-y-2">
        {(data||[]).map((jr:any)=> (
          <div key={jr.id} className="flex items-center gap-3">
            <div className="flex-1">{jr.name} &lt;{jr.email}&gt; — {jr.status}</div>
            {jr.status==="pending" && <button onClick={()=>approve(jr.id)} className="px-3 py-1 rounded-lg bg-ak-neon text-black">Approve</button>}
          </div>
        ))}
      </div>
    </UltraCard>
  );
}
