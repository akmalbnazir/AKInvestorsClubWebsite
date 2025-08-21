import { create } from "zustand";
type Burst = { x:number; y:number; id:number };
type Wave  = { id:number; x:number; y:number; t:number };
type FXState = {
  mouse: { x: number; y: number };
  bursts: Burst[];
  waves: Wave[];
  setMouse: (x:number,y:number)=>void;
  addBurst: (x:number,y:number)=>void;
  addWave: (x:number,y:number)=>void;
  stepWaves: ()=>void;
  popBurst: (id:number)=>void;
};
let nextId = 1;
export const useFXBus = create<FXState>((set,get) => ({
  mouse: { x: 0, y: 0 },
  bursts: [], waves: [],
  setMouse: (x,y)=> set({ mouse: { x, y } }),
  addBurst: (x,y)=> set(s=>({ bursts:[...s.bursts,{x,y,id:nextId++}] })),
  addWave: (x,y)=> set(s=>({ waves:[...s.waves,{x,y,t:0,id:nextId++}] })),
  stepWaves: ()=> set(s=>({ waves: s.waves.map(w=>({ ...w, t: Math.min(1, w.t + 0.04) })).filter(w=>w.t<1) })),
  popBurst: (id)=> set(s=>({ bursts: s.bursts.filter(b=>b.id!==id) })),
}));
