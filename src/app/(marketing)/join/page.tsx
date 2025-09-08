"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import UltraCard from "components/ui/UltraCard";
type FormData = { name: string; email: string; grade: string; interest: string };
export default function JoinPage() {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const onSubmit = async (data: FormData) => {
    setOk(null); setErr(null);
    const res = await fetch("/api/join", { method: "POST", body: JSON.stringify(data) });
    if (res.ok) { setOk("Thanks! An officer will review your request."); reset(); }
    else { setErr("Submission failed."); }
  };
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <UltraCard className="text-center">
        <h2 className="text-3xl font-bold mb-4">Join AKIC</h2>
        <p className="text-ak-sub mb-6">Use your school email.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input className="w-full rounded-lg bg-black/40 p-3" placeholder="Full name" {...register("name", { required: true })} />
          <input className="w-full rounded-lg bg-black/40 p-3" placeholder="School email" type="email" {...register("email", { required: true })} />
          <input className="w-full rounded-lg bg-black/40 p-3" placeholder="Grade (e.g., 10)" {...register("grade")} />
          <textarea className="w-full rounded-lg bg-black/40 p-3" placeholder="Why do you want to join?" rows={4} {...register("interest")} />
          <button className="px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">Submit</button>
        </form>
        {ok && <div className="text-emerald-400 mt-3">{ok}</div>}
        {err && <div className="text-red-400 mt-3">{err}</div>}
      </UltraCard>
    </div>
  );
}
