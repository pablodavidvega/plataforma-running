"use client";

import React from "react";
import { isSupabaseConfigured } from "../lib/supabase";

interface AuthLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export default function AuthLayout({ children, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center p-4 py-10 relative overflow-x-hidden font-sans">
      
      {/* Immersive background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg flex flex-col gap-6 relative z-10 row-anim">
        
        {/* Dynamic connection indicator banner */}
        <div className="flex justify-center">
          {isSupabaseConfigured ? (
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 glow-neon">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Conexión Real Supabase Activa
            </span>
          ) : (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Modo Simulación Local Activo (Fallback)
            </span>
          )}
        </div>

        {/* Glassmorphic Auth Box */}
        <div className="glass-panel rounded-3xl p-8 border-zinc-800/80 shadow-2xl relative overflow-hidden flex flex-col">
          {/* Brand header */}
          <div className="text-center mb-6">
            <span className="text-[20px] bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 w-11 h-11 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg shadow-orange-500/25 mx-auto mb-3.5">
              ⚡
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase leading-none">
              KIP<span className="text-[var(--brand-coral)]">RUN</span>
            </h2>
            <p className="text-[11px] text-zinc-500 font-semibold uppercase tracking-wider mt-1.5">
              {subtitle}
            </p>
          </div>

          {/* Children form contents */}
          <div className="flex-1">
            {children}
          </div>
        </div>

        {/* Small hint at the bottom about fallback logic */}
        {!isSupabaseConfigured && (
          <div className="text-center text-[10px] text-zinc-500 leading-normal px-6">
            💡 <strong>Tip de Supabase:</strong> Si deseas conectar tu base de datos real, renombra el archivo <code className="text-zinc-400">.env.local.example</code> a <code className="text-zinc-400">.env.local</code> y pega tus credenciales de Supabase.
          </div>
        )}

      </div>
    </div>
  );
}
