"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Flame, Coffee, Trees, User, Volume2 } from "lucide-react";

const SOUND_SOURCES = [
  { id: "rain", icon: <CloudRain size={32} />, label: "Rain", color: "from-blue-400 to-blue-600", file: "/sounds/rain.mp3" },
  { id: "fire", icon: <Flame size={32} />, label: "Fire", color: "from-orange-400 to-orange-600", file: "/sounds/fire.mp3" },
  { id: "cafe", icon: <Coffee size={32} />, label: "Cafe", color: "from-amber-500 to-amber-700", file: "/sounds/cafe.mp3" },
  { id: "forest", icon: <Trees size={32} />, label: "Forest", color: "from-green-400 to-green-600", file: "/sounds/forest.mp3" },
];

export default function ZenSoundscape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [listenerPos, setListenerPos] = useState({ x: 0, y: 0 });
  const [volumes, setVolumes] = useState<{ [key: string]: number }>({
    rain: 0, fire: 0, cafe: 0, forest: 0
  });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setListenerPos({ x: rect.width / 2, y: rect.height / 2 });
    }
  }, []);

  const handleDrag = (id: string, info: any) => {
    const audio = audioRefs.current[id];
    if (!audio || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = info.point.x - rect.left;
    const y = info.point.y - rect.top;

    const dx = x - listenerPos.x;
    const dy = y - listenerPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxDist = 350;
    const volume = Math.max(0, Math.min(1, 1 - distance / maxDist));
    
    audio.volume = volume;
    setVolumes(prev => ({ ...prev, [id]: volume }));

    if (audio.paused && volume > 0) {
      audio.play().catch(() => {}); // ユーザー操作前の再生ブロック対策
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050505] overflow-hidden font-extralight text-zinc-300">
      {/* 背景の環境光エフェクト */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#111_0%,_#000_100%)]" />

      {/* UI: Header */}
      <div className="relative z-50 p-10 flex justify-between items-start">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl tracking-[0.3em] text-white font-thin uppercase">Zen Space</h1>
          <p className="text-[10px] mt-2 opacity-40 tracking-widest">MOVE ICONS TO MIX AMBIENCE</p>
        </motion.div>
        <Volume2 className="text-white/20 animate-pulse" />
      </div>

      {/* Main Canvas */}
      <div ref={containerRef} className="relative w-full h-[65vh]">
        {/* Central Listener (The "Me" icon) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="absolute w-40 h-40 border border-white/5 rounded-full animate-ping opacity-20" />
          <div className="absolute w-80 h-80 border border-white/5 rounded-full opacity-10" />
          <div className="z-20 p-5 bg-white/5 backdrop-blur-2xl rounded-full border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            <User size={32} className="text-white" />
          </div>
        </div>

        {/* Draggable Sound Icons */}
        {SOUND_SOURCES.map((src) => (
          <motion.div
            key={src.id}
            drag
            dragMomentum={false}
            onDrag={(_, info) => handleDrag(src.id, info)}
            className={`absolute z-30 p-8 rounded-[2rem] cursor-grab active:cursor-grabbing bg-gradient-to-br ${src.color} shadow-2xl`}
            style={{ x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: -5 }}
          >
            <div className="text-white drop-shadow-lg">{src.icon}</div>
            <audio ref={el => { audioRefs.current[src.id] = el; }} src={src.file} loop />
          </motion.div>
        ))}
      </div>

      {/* Bento Grid: Volume Status */}
      <div className="relative z-50 max-w-5xl mx-auto px-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {SOUND_SOURCES.map((src) => (
          <div key={src.id} className="bg-white/[0.03] border border-white/[0.05] backdrop-blur-md rounded-2xl p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] tracking-widest opacity-50 uppercase">
              <span>{src.label}</span>
              <span>{Math.round(volumes[src.id] * 100)}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full bg-gradient-to-r ${src.color}`} 
                animate={{ width: `${volumes[src.id] * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}