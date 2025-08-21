"use client";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) window.location.href = "/";
    else alert("Invalid credentials");
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={submit} className="card w-80 space-y-4">
        <h2 className="text-xl font-bold">Sign In</h2>
        <input
          value={email}
          onChange={e=>setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full rounded p-2 bg-ak-panel"
        />
        <input
          value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full rounded p-2 bg-ak-panel"
        />
        <button type="submit" className="w-full bg-ak-neon text-black py-2 rounded">Sign In</button>
      </form>
    </div>
  );
}
