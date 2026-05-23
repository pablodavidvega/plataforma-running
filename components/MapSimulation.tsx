"use client";

import React, { useState } from "react";

interface RunnerNear {
  id: string;
  name: string;
  distance: number; // in km
  pace: string;
  avatar: string;
  latOffset: number; // offset for SVG rendering
  lngOffset: number; // offset for SVG rendering
  status: "active" | "offline";
}

// Mock runners within Delicias, Bogotá (5km radius)
const MOCK_NEARBY_RUNNERS: RunnerNear[] = [
  { id: "r1", name: "Camilo Torres", distance: 1.2, pace: "4:15 min/km", avatar: "👨‍🚀", latOffset: -35, lngOffset: 45, status: "active" },
  { id: "r2", name: "Valentina Gómez", distance: 2.8, pace: "4:45 min/km", avatar: "👩‍🎤", latOffset: 60, lngOffset: -50, status: "active" },
  { id: "r3", name: "Mateo Rodríguez", distance: 0.7, pace: "3:55 min/km", avatar: "👨‍🎨", latOffset: -15, lngOffset: -25, status: "active" },
  { id: "r4", name: "Sofía Martínez", distance: 4.1, pace: "5:10 min/km", avatar: "👩‍💼", latOffset: 110, lngOffset: 80, status: "offline" },
  { id: "r5", name: "Andrés Silva", distance: 3.5, pace: "4:30 min/km", avatar: "👨‍🔧", latOffset: 85, lngOffset: 120, status: "active" },
  { id: "r6", name: "Daniela Beltrán", distance: 1.9, pace: "4:20 min/km", avatar: "👩‍⚕️", latOffset: -70, lngOffset: -90, status: "active" },
  { id: "r7", name: "Carlos Mendoza", distance: 4.8, pace: "5:00 min/km", avatar: "👨‍💼", latOffset: -120, lngOffset: 110, status: "offline" }
];

interface MapSimulationProps {
  userLocationName?: string;
}

export default function MapSimulation({ userLocationName = "Delicias, Bogotá" }: MapSimulationProps) {
  const [selectedRadius, setSelectedRadius] = useState<number>(5); // 5km max
  const [hoveredRunner, setHoveredRunner] = useState<RunnerNear | null>(null);

  // Filter runners by chosen radius
  const visibleRunners = MOCK_NEARBY_RUNNERS.filter(r => r.distance <= selectedRadius);

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col glow-coral h-[420px] transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Radar Comunitario</h3>
          <p className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            {userLocationName}
          </p>
        </div>
        
        {/* Radius Filter */}
        <div className="flex gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          {[1, 3, 5].map(radius => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                selectedRadius === radius
                  ? "bg-[var(--brand-coral)] text-white shadow-lg shadow-orange-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {radius}km
            </button>
          ))}
        </div>
      </div>

      {/* Map/Radar Canvas */}
      <div className="flex-1 w-full relative flex items-center justify-center bg-zinc-950/40 rounded-2xl border border-zinc-900/60 overflow-hidden">
        
        {/* SVG Grid & Concentric Radar Rings */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
          {/* Cyberpunk grid lines */}
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          {/* Diagonal grids */}
          <line x1="0" y1="0" x2="100%" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
          <line x1="100%" y1="0" x2="0" y2="100%" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeDasharray="3 3" />
        </svg>

        {/* Concentric radar circles relative to selected radius */}
        <div className="absolute rounded-full border border-zinc-800/80 w-[100px] h-[100px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-zinc-600 font-semibold absolute -top-3">1 km</span>
        </div>
        <div className="absolute rounded-full border border-zinc-800/80 w-[200px] h-[200px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-zinc-600 font-semibold absolute -top-3">3 km</span>
        </div>
        <div className="absolute rounded-full border border-zinc-800/50 w-[300px] h-[300px] pointer-events-none flex items-center justify-center">
          <span className="text-[9px] text-zinc-600 font-semibold absolute -top-3">5 km</span>
        </div>

        {/* Pulsing radar sweeps */}
        <div className="absolute w-[300px] h-[300px] pointer-events-none flex items-center justify-center">
          <div className="absolute rounded-full w-[120px] h-[120px] bg-[var(--brand-coral)] opacity-10 animate-radar" />
          <div className="absolute rounded-full w-[240px] h-[240px] bg-[var(--brand-coral)] opacity-5 animate-radar [animation-delay:1.5s]" />
        </div>

        {/* Center Node: Current User */}
        <div className="absolute z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 p-0.5 shadow-2xl shadow-orange-500/40 border border-white/20">
            <span className="text-xl">🏃</span>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-950 rounded-full animate-pulse-glow" />
          </div>
          <span className="mt-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-white tracking-wide shadow-lg uppercase">
            Tú
          </span>
        </div>

        {/* Nearby Runners Icons on the Radar */}
        {visibleRunners.map(runner => {
          // Adjust coordinate scale based on current filter size to zoom in/out elegantly
          const zoomFactor = selectedRadius === 1 ? 4.5 : selectedRadius === 3 ? 1.5 : 1.0;
          const x = runner.lngOffset * zoomFactor;
          const y = runner.latOffset * zoomFactor;

          const isHovered = hoveredRunner?.id === runner.id;

          return (
            <div
              key={runner.id}
              className="absolute z-10 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{
                transform: `translate(${x}px, ${y}px)`
              }}
              onMouseEnter={() => setHoveredRunner(runner)}
              onMouseLeave={() => setHoveredRunner(null)}
            >
              <button
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border bg-zinc-900 shadow-xl transition-all cursor-pointer ${
                  runner.status === "active"
                    ? "border-emerald-500/50 hover:border-emerald-400 glow-neon"
                    : "border-zinc-800 hover:border-zinc-600"
                } ${isHovered ? "scale-125 z-20 border-[var(--brand-coral)]!" : ""}`}
              >
                <span className="text-sm">{runner.avatar}</span>
                {runner.status === "active" && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-zinc-950 rounded-full" />
                )}
              </button>
            </div>
          );
        })}

        {/* Dynamic Hover Tooltip overlay */}
        {hoveredRunner && (
          <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-2xl p-3 border-zinc-800 z-30 shadow-2xl flex items-center gap-3 transition-all duration-300 row-anim">
            <div className="text-2xl bg-zinc-800/80 p-2 rounded-xl border border-zinc-700/60 w-11 h-11 flex items-center justify-center">
              {hoveredRunner.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white truncate">{hoveredRunner.name}</h4>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <span>📍 A {hoveredRunner.distance} km</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[var(--brand-coral)] font-semibold">{hoveredRunner.pace}</span>
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                hoveredRunner.status === "active" 
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                  : "bg-zinc-800/40 text-zinc-500 border border-zinc-800/40"
              }`}>
                {hoveredRunner.status === "active" ? "Activo" : "Offline"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats Summary */}
      <div className="mt-4 flex justify-between items-center text-xs text-zinc-400 px-1 border-t border-zinc-900/60 pt-3">
        <span className="flex items-center gap-1.5">
          🏃‍♂️ <strong className="text-white">{visibleRunners.length}</strong> corredores detectados
        </span>
        <span>
          Radio: <strong className="text-white">{selectedRadius} km</strong>
        </span>
      </div>
    </div>
  );
}
