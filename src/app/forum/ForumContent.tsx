"use client";

import useSWR from "swr";
import UltraCard from "components/ui/UltraCard";
import { useState, useMemo } from "react";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function ForumContent() {
  // posts + optimistic refresh
  const { data: posts, mutate } = useSWR("/api/forum/posts", fetcher);

  // new post
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const create = async () => {
    if (!title.trim() || !body.trim()) return;
    await fetch("/api/forum/posts", {
      method: "POST",
      body: JSON.stringify({ title, body })
    });
    setTitle(""); setBody("");
    mutate();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <UltraCard>
        <div className="text-lg font-semibold mb-2">Ask a question</div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-2 rounded-lg bg-black/40 p-3"
        />
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Details"
          rows={4}
          className="w-full rounded-lg bg-black/40 p-3"
        />
        <button onClick={create} className="mt-3 px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">
          Post
        </button>
      </UltraCard>

      {(posts || []).map((p: any) => (
        <PostItem key={p.id} post={p} onChanged={mutate} />
      ))}
    </div>
  );
}

function PostItem({ post, onChanged }: { post: any; onChanged: () => void }) {
  const [reply, setReply] = useState("");
  const { data: replies, mutate: mutateReplies } = useSWR(`/api/forum/posts/${post.id}/replies`, fetcher);

  // Simple admin detection by role if server injected somewhere; fallback: show reply UI only if server adds flag.
  // For now, we’ll fetch a minimal “am I admin” endpoint or pass it via props.
  // To keep this simple now, show the reply UI and let the API enforce admin.
  const canReply = true; // API will reject non-admins

  const submitReply = async () => {
    if (!reply.trim()) return;
    const res = await fetch(`/api/forum/posts/${post.id}/replies`, {
      method: "POST",
      body: JSON.stringify({ body: reply })
    });
    if (res.ok) {
      setReply("");
      mutateReplies();
      onChanged();
    } else {
      const e = await res.json().catch(() => ({}));
      alert(e.error || "Failed to reply (admin only).");
    }
  };

  return (
    <UltraCard>
      <div className="text-xl font-semibold">{post.title}</div>
      <div className="mt-2 whitespace-pre-wrap">{post.content}</div>
      <div className="mt-3 text-sm text-ak-sub">{post._count?.comments || 0} comments</div>

      <div className="mt-4 space-y-2">
        {(replies || []).map((c: any) => (
          <div key={c.id} className="rounded-lg bg-black/40 p-3">
            <div className="text-sm text-ak-sub mb-1">
              {c.author?.name || c.author?.email} {c.author?.role ? `• ${c.author.role}` : ""}
            </div>
            <div className="whitespace-pre-wrap">{c.content}</div>
          </div>
        ))}
      </div>

      {canReply && (
        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg bg-black/40 p-3"
            placeholder="Admin reply..."
            value={reply}
            onChange={e => setReply(e.target.value)}
          />
          <button onClick={submitReply} className="px-4 py-2 rounded-lg bg-ak-neon text-black font-semibold">
            Reply
          </button>
        </div>
      )}
    </UltraCard>
  );
}
