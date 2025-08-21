"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useFXBus } from "store/useFXBus";
import { useEffect, useMemo, useRef } from "react";

function useWindowInputs(){
  const setMouse = useFXBus(s => s.setMouse);
  const addBurst = useFXBus(s => s.addBurst);
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse(e.clientX, e.clientY);
    const onClick = (e: MouseEvent) => addBurst(e.clientX, e.clientY);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("click", onClick); };
  }, [setMouse, addBurst]);
}
function toNDC(x:number,y:number,w:number,h:number){ return new THREE.Vector2((x/w)*2-1, -(y/h)*2+1); }

function useCircleTexture(){
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const r = size/2;
    const g = ctx.createRadialGradient(r, r, 0, r, r, r);
    g.addColorStop(0.0, "rgba(255,255,255,1)");
    g.addColorStop(0.2, "rgba(255,255,255,0.9)");
    g.addColorStop(1.0, "rgba(255,255,255,0)");
    ctx.clearRect(0,0,size,size);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(r, r, r, 0, Math.PI*2); ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);
}

function Galaxy(){
  const points = useRef<THREE.Points>(null!);
  const sprite = useCircleTexture();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const N = 16000;
    const pos = new Float32Array(N*3);
    const col = new Float32Array(N*3);
    const c = new THREE.Color();
    for(let i=0;i<N;i++){
      const r = Math.random()*12;
      const a = (i/N)*Math.PI*10 + Math.random()*0.8;
      const x = Math.cos(a)*r, y = (Math.random()-0.5)*2.0, z = Math.sin(a)*r;
      pos.set([x,y,z], i*3);
      c.setHSL(0.38 + Math.random()*0.06, 1, 0.55 + Math.random()*0.15);
      col.set([c.r,c.g,c.b], i*3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos,3));
    g.setAttribute("color", new THREE.BufferAttribute(col,3));
    return g;
  }, []);
  const mat = useMemo(()=> new THREE.PointsMaterial({
    size: 0.06, map: sprite, alphaTest:0.1, transparent:true, depthWrite:false, vertexColors:true, blending:THREE.AdditiveBlending
  }), [sprite]);
  useFrame((state, dt)=>{
    points.current.rotation.y += dt*0.05;
    const t = state.clock.elapsedTime;
    state.camera.position.z = 7 + Math.sin(t*0.25)*0.5;
    state.camera.position.x = Math.sin(t*0.18)*0.4;
    state.camera.lookAt(0,0,0);
  });
  return <points ref={points} geometry={geom} material={mat} />;
}

function ClickBursts(){
  const { size, camera } = useThree();
  const bursts = useFXBus(s=>s.bursts);
  const pop    = useFXBus(s=>s.popBurst);
  const group = useRef<THREE.Group>(null!);
  const mats = useMemo(()=>[
    new THREE.MeshBasicMaterial({ color:"#00FF88", transparent:true, opacity:0.9, blending:THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color:"#00D1B2", transparent:true, opacity:0.7, blending:THREE.AdditiveBlending }),
    new THREE.MeshBasicMaterial({ color:"#67ffda", transparent:true, opacity:0.4, blending:THREE.AdditiveBlending }),
  ],[]);
  useFrame((_,dt)=>{
    if (!group.current) return;
    group.current.children.forEach((m:any)=>{ m.scale.x+=dt*2.2; m.scale.y+=dt*2.2; m.material.opacity*=0.94; });
  });
  useEffect(()=>{
    if(!group.current) return;
    for(const b of bursts){
      const ndc = toNDC(b.x,b.y,size.width,size.height);
      const pos = new THREE.Vector3(ndc.x, ndc.y, 0.3).unproject(camera);
      for(let i=0;i<3;i++){
        const ring = new THREE.Mesh(new THREE.RingGeometry(0.1+(i*0.04), 0.12+(i*0.04), 92), mats[i%3]);
        ring.position.copy(pos);
        group.current.add(ring);
      }
      pop(b.id);
    }
  },[bursts,size,camera,pop,mats]);
  return <group ref={group} />;
}

export default function GlobalFX(){
  useWindowInputs();
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position:[0,0,7], fov:60 }} gl={{ antialias:true }}>
        <color attach="background" args={[0x050607]} />
        <Galaxy />
        <ClickBursts />
      </Canvas>
    </div>
  );
}
