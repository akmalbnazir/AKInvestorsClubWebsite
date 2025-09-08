"use client";
import { useEffect, useState } from "react";

type Lesson = { title: string; content: string };
type QuizQ = { q: string; a: string[]; correct: number };
type Module = { title: string; lessons: Lesson[]; quiz: QuizQ[] };

export default function CourseClient({ course }: { course: { title:string; modules: Module[] }}){
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [open, setOpen] = useState<number|null>(0);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(()=>{ fetch("/api/course/progress").then(r=>r.json()).then(d=>{
    const map: Record<string,any> = {};
    const s: Record<string, number> = {};
    for(const p of d.progress||[]){ map[p.key]=p; if(p.score!=null) s[p.key]=p.score; }
    setProgress(map); setScores(s);
  }); },[]);

  async function mark(moduleIdx:number, lessonIdx:number, status="completed", score?:number){
    const key = `course:${moduleIdx}:${lessonIdx}`;
    const res = await fetch("/api/course/progress", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ key, status, score }) });
    const json = await res.json();
    if(res.ok){
      setProgress(p => ({ ...p, [key]: json.progress }));
      if(score!=null) setScores(s => ({ ...s, [key]: score }));
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="text-white/70">Interactive lessons, quizzes, and saved progress. Click a module to expand.</p>

      <div className="space-y-3">
        {course.modules.map((m, mi)=>(
          <div key={mi} className="rounded-xl bg-ak-panel p-4">
            <button onClick={()=>setOpen(open===mi?null:mi)} className="w-full text-left text-xl font-semibold">
              {mi+1}. {m.title}
            </button>
            {open===mi && (
              <div className="mt-3 space-y-4">
                {m.lessons.map((l, li)=>(
                  <div key={li} className="p-3 rounded bg-black/30 border border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{mi+1}.{li+1} {l.title}</h3>
                      <button onClick={()=>mark(mi,li,"completed")} className="text-xs px-2 py-1 rounded bg-ak-neon text-black">Mark Complete</button>
                    </div>
                    <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{l.content}</p>
                  </div>
                ))}

                <div className="p-3 rounded bg-black/40 border border-white/10">
                  <h3 className="font-semibold mb-2">Module Quiz</h3>
                  <Quiz moduleIndex={mi} quiz={m.quiz} onScore={(score)=>{
                    const key = `course:${mi}:quiz`;
                    mark(mi,999,"completed",score);
                    setScores(s => ({ ...s, [key]: score }));
                  }} scores={scores} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Quiz({ moduleIndex, quiz, onScore, scores }:{ moduleIndex:number; quiz:QuizQ[]; onScore:(s:number)=>void; scores:Record<string, number> }){
  const [answers, setAnswers] = useState<number[]>(Array(quiz.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const key = `course:${moduleIndex}:quiz`;
  const lastScore = scores[key];

  function submit(){
    let score = 0; for(let i=0;i<quiz.length;i++){ if(answers[i]===quiz[i].correct) score++; }
    setSubmitted(true); onScore(score);
  }

  return (
    <div>
      {lastScore!=null && <div className="mb-2 text-sm text-white/70">Last score: {lastScore}/{quiz.length}</div>}
      {quiz.map((q:any, qi:number)=>(
        <div key={qi} className="mb-3">
          <div className="font-medium">{qi+1}. {q.q}</div>
          <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
            {q.a.map((opt:string, oi:number)=>{
              const sel = answers[qi]===oi;
              const correct = submitted && oi===q.correct;
              const wrong = submitted && sel && oi!==q.correct;
              return (
                <button key={oi} onClick={()=>!submitted && setAnswers(a => (a.map((v,idx)=> idx===qi ? oi : v)))} className={`text-left px-3 py-2 rounded border ${sel?'border-ak-neon':'border-white/10'} ${correct?'bg-green-600/50':''} ${wrong?'bg-red-600/50':''} bg-black/40`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button onClick={submit} className="mt-2 px-3 py-2 rounded bg-ak-neon text-black">Submit</button>
      ): <div className="mt-2 text-sm text-white/70">Submitted!</div>}
    </div>
  );
}
