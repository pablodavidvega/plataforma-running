"use client";

import React, { useState } from "react";

interface StatItem {
  label: string;
  value: string;
  change: string;
  icon: string;
  colorClass: string;
}

interface ChartBar {
  day: string;
  distance: number; // in km
  label: string;
}

const WEEKLY_DATA: ChartBar[] = [
  { day: "Lun", distance: 8.2, label: "Trote matutino - 8.2 km" },
  { day: "Mar", distance: 5.0, label: "Intervalos de pista - 5.0 km" },
  { day: "Mié", distance: 0, label: "Descanso activo" },
  { day: "Jue", distance: 10.4, label: "Tempo run - 10.4 km" },
  { day: "Vie", distance: 6.2, label: "Trote de recuperación - 6.2 km" },
  { day: "Sáb", distance: 15.0, label: "Largo de fin de semana - 15.0 km" },
  { day: "Dom", distance: 0, label: "Día de descanso" }
];

const MONTHLY_DATA: ChartBar[] = [
  { day: "Sem 1", distance: 35.2, label: "Semana de base - 35.2 km" },
  { day: "Sem 2", distance: 44.8, label: "Semana de volumen - 44.8 km" },
  { day: "Sem 3", distance: 48.0, label: "Pico de volumen - 48.0 km" },
  { day: "Sem 4", distance: 32.5, label: "Semana de descarga - 32.5 km" }
];

const BADGES = [
  { name: "Leyenda Local", icon: "👑", desc: "Mejor tiempo en el barrio Delicias 5K", unlocked: true },
  { name: "Cazador de Trail", icon: "⛰️", desc: "Completaste 3 carreras de Trail registradas", unlocked: true },
  { name: "Sub-20 Minutos", icon: "⚡", desc: "Tiempo menor a 20 min en 5K de pista", unlocked: true },
  { name: "Explorador Global", icon: "🌎", desc: "Ingresaste tiempos en 3 países", unlocked: false }
];

export default function DashboardStats() {
  const [chartType, setChartType] = useState<"semana" | "mes">("semana");
  const [hoveredBar, setHoveredBar] = useState<ChartBar | null>(null);

  const activeData = chartType === "semana" ? WEEKLY_DATA : MONTHLY_DATA;
  const maxDistance = Math.max(...activeData.map(d => d.distance), 1);

  const stats: StatItem[] = [
    { label: "Distancia Semanal", value: "44.8 Km", change: "+12% vs. sem. anterior", icon: "🏃‍♂️", colorClass: "text-[var(--brand-coral)] border-orange-500/20" },
    { label: "Ritmo Promedio", value: "4:28 min/km", change: "-5 seg. más rápido", icon: "⏱️", colorClass: "text-emerald-400 border-emerald-500/20" },
    { label: "Tiempo de Actividad", value: "3h 24m", change: "4 entrenamientos completados", icon: "⏳", colorClass: "text-cyan-400 border-cyan-500/20" },
    { label: "Elevación Ganada", value: "410 m", change: "Enfocado en cuestas de montaña", icon: "⛰️", colorClass: "text-amber-400 border-amber-500/20" }
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* 4 Pillars Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="glass-panel rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700/60 transition-all duration-300 group hover:-translate-y-1"
          >
            {/* Top row */}
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                {stat.label}
              </span>
              <span className="text-xl bg-zinc-800/60 w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-700/30">
                {stat.icon}
              </span>
            </div>
            
            {/* Value & Trend */}
            <div>
              <div className="text-2xl font-black text-white tracking-tight leading-none mb-1.5">
                {stat.value}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium">
                {stat.change}
              </div>
            </div>
            
            {/* Subtle glow border hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--brand-coral)] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
        ))}
      </div>

      {/* Main Bar Chart Panel */}
      <div className="glass-panel rounded-3xl p-6 glow-coral flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Resumen de Carga</h3>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">Volumen de Entrenamiento</h2>
          </div>
          
          <div className="flex gap-1.5 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setChartType("semana")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                chartType === "semana"
                  ? "bg-zinc-800 text-white border border-zinc-700/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Semanal
            </button>
            <button
              onClick={() => setChartType("mes")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                chartType === "mes"
                  ? "bg-zinc-800 text-white border border-zinc-700/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Mensual
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-[180px] w-full flex items-end justify-between gap-3 px-2 relative pt-6 border-b border-zinc-900/60 pb-1">
          {activeData.map((data, index) => {
            const pct = (data.distance / maxDistance) * 100;
            const isZero = data.distance === 0;

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredBar(data)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Visual Bar */}
                <div
                  className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${
                    isZero
                      ? "h-[6px] bg-zinc-800/80 border border-zinc-700/20"
                      : "bg-gradient-to-t from-[var(--brand-coral)] to-rose-400 hover:brightness-110 shadow-lg shadow-orange-500/10 group-hover:shadow-orange-500/25"
                  }`}
                  style={{ height: isZero ? "6px" : `${pct}%` }}
                />
                
                {/* Horizontal line at bottom of bars */}
                <span className="text-[10px] text-zinc-400 font-bold tracking-wide mt-2">
                  {data.day}
                </span>
              </div>
            );
          })}

          {/* Interactive Hover Tooltip */}
          {hoveredBar && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 glass-panel rounded-xl px-3 py-1.5 border-zinc-800 text-xs font-bold text-white z-10 shadow-lg shadow-black/80 flex items-center gap-2 row-anim">
              <span>{hoveredBar.label}</span>
              {hoveredBar.distance > 0 && (
                <span className="text-[var(--brand-coral)]">🏆</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Badges Panel */}
      <div className="glass-panel rounded-3xl p-6">
        <h3 className="text-sm font-semibold tracking-wider text-zinc-400 uppercase mb-4">Mis Logros y Trofeos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-center gap-3.5 ${
                badge.unlocked
                  ? "bg-zinc-950/40 border-zinc-800/60 hover:border-[var(--brand-coral)]/30"
                  : "bg-zinc-950/10 border-zinc-900/40 opacity-40 select-none"
              }`}
            >
              <div className="text-3xl bg-zinc-900/60 w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-800/60">
                {badge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{badge.name}</h4>
                <p className="text-[10px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
