"use client";

import React, { useState } from "react";
import MapSimulation from "../components/MapSimulation";
import DashboardStats from "../components/DashboardStats";
import Leaderboards from "../components/Leaderboards";
import SocialHub from "../components/SocialHub";

export default function Home() {
  // Session / Registration State
  const [isRegistered, setIsRegistered] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAvatar, setUserAvatar] = useState("🏃‍♂️");
  const [userNeighborhood, setUserNeighborhood] = useState("Delicias");
  const [userCity, setUserCity] = useState("Bogotá");
  const [userCountry, setUserCountry] = useState("Colombia");
  const [useGps, setUseGps] = useState(true);

  // App Layout State
  const [activeTab, setActiveTab] = useState<"stats" | "rankings" | "social">("stats");

  // Visual feedback states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Emojis for custom athletic profiles
  const AVATARS = ["🏃‍♂️", "🏃‍♀️", "⚡", "🥇", "👟", "🔥", "🪐"];

  // Simulate GPS lookup
  const handleGpsTrigger = () => {
    if (!useGps) return;
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setToastMessage("📍 GPS: Ubicación configurada en Delicias, Bogotá (Sector 5)");
      setTimeout(() => setToastMessage(null), 4000);
    }, 1500);
  };

  const handleStartApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setUserName("Corredor Anónimo");
    }
    setIsRegistered(true);
    handleGpsTrigger();
  };

  // Callback when user adds a score in leaderboards
  const handleScoreAdded = (raceName: string, time: string) => {
    setToastMessage(`🏆 ¡Score guardado! Registraste ${time} en "${raceName}". ¡Tu ranking se ha recalculado!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-[#060609] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract design vector glows */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 relative border-zinc-800/80 shadow-2xl z-10 row-anim">
          {/* Header Title */}
          <div className="text-center mb-8">
            <span className="text-[10px] bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] border border-[var(--brand-coral)]/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
              PRÓXIMA GENERACIÓN DE RUNNING 👟
            </span>
            <h1 className="text-4xl font-black tracking-tight text-white mt-4 uppercase leading-none">
              Plataforma <span className="bg-gradient-to-r from-[var(--brand-coral)] to-rose-400 bg-clip-text text-transparent">Running</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-2.5 max-w-sm mx-auto">
              Compite en rankings jerárquicos a partir de tu geocerca local de 5 km, y únete a salidas en grupo cerca de ti.
            </p>
          </div>

          <form onSubmit={handleStartApp} className="flex flex-col gap-5">
            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Tu Nombre de Corredor</label>
              <input
                type="text"
                required
                placeholder="Ej. David Valenzuela"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
              />
            </div>

            {/* Avatar Picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Elige tu Avatar</label>
              <div className="flex gap-2 justify-between bg-zinc-950/60 p-2 rounded-2xl border border-zinc-900">
                {AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserAvatar(av)}
                    className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                      userAvatar === av
                        ? "bg-[var(--brand-coral)]/10 border-[var(--brand-coral)] text-white shadow-lg"
                        : "bg-zinc-900/40 border-transparent hover:border-zinc-800"
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Barrio / Sector</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Delicias"
                  value={userNeighborhood}
                  onChange={(e) => setUserNeighborhood(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--brand-coral)] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">Ciudad</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Bogotá"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--brand-coral)] transition-all"
                />
              </div>
            </div>

            {/* GPS Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-950/40 border border-zinc-900 rounded-2xl">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Detección GPS Activa</span>
                <span className="text-[9px] text-zinc-500 mt-0.5">Calcula automáticamente tu ranking a 5km a la redonda</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useGps}
                  onChange={() => setUseGps(!useGps)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--brand-coral)]" />
              </label>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[var(--brand-coral)] to-rose-500 hover:brightness-110 text-white font-bold py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-500/10 cursor-pointer mt-2"
            >
              Comenzar a Correr ⚡
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060609] text-white flex flex-col relative overflow-x-hidden font-sans">
      
      {/* Background radial overlays */}
      <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-full bg-orange-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

      {/* Global Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 glass-panel border-[var(--brand-coral)]/30 rounded-2xl p-4 max-w-sm shadow-2xl flex items-start gap-3 w-[320px] row-anim glow-coral">
          <span className="text-xl">🏆</span>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white">Notificación de Ranking</h4>
            <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-600 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Dynamic locating overlay banner */}
      {isLocating && (
        <div className="w-full bg-[var(--brand-coral)] text-white text-center py-2 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 animate-pulse-glow z-40">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          Configurando geocerca local y conectando con satélites GPS...
        </div>
      )}

      {/* Desktop Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* COLUMN 1: Profile Sidebar & Tab Navigation */}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-2xl bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg shadow-orange-500/20">
              ⚡
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tighter uppercase leading-none text-white">
                PLATA<span className="text-[var(--brand-coral)]">RUN</span>
              </h2>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 inline-block">
                Geo-Rankings v1.0
              </span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="glass-panel rounded-3xl p-5 border-zinc-800/80">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl bg-zinc-900 w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-800/60">
                {userAvatar}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-white truncate">{userName}</h3>
                <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                  <span>📍 {userNeighborhood}</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span className="text-zinc-500">{userCity}</span>
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px]">
              <span className="text-zinc-500 font-bold uppercase tracking-wider">Estado GPS</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Conectado
              </span>
            </div>
          </div>

          {/* Nav Menu */}
          <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-900/60">
            {[
              { id: "stats", label: "📊 Mi Dashboard", desc: "Estadísticas y volumen de carga" },
              { id: "rankings", label: "🏆 Rankings de Carrera", desc: "Local, Ciudad, País y Global" },
              { id: "social", label: "💬 Comunidad & Salidas", desc: "Mensajes y entrenamientos de zona" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-zinc-900 border border-zinc-800 text-white shadow-md"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-bold">{tab.label}</div>
                <div className="text-[9px] text-zinc-500 mt-0.5">{tab.desc}</div>
              </button>
            ))}
          </div>

          {/* Quick Info Box */}
          <div className="hidden lg:block p-4.5 rounded-2xl bg-zinc-950/20 border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed font-semibold">
            🚀 <strong>Valor Agregado:</strong> Tus rankings cambian dinámicamente según tu coordenada actual. ¡Registra tus scores para ver tu puesto hiperlocal!
          </div>
        </div>

        {/* COLUMN 2 & 3: Main Active Tab Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {activeTab === "stats" && (
            <div className="flex flex-col gap-6 row-anim">
              <DashboardStats />
            </div>
          )}

          {activeTab === "rankings" && (
            <div className="flex flex-col gap-6 row-anim">
              <Leaderboards
                userName={userName}
                userAvatar={userAvatar}
                userNeighborhood={userNeighborhood}
                userCity={userCity}
                userCountry={userCountry}
                onScoreAdded={handleScoreAdded}
              />
            </div>
          )}

          {activeTab === "social" && (
            <div className="flex flex-col gap-6 row-anim">
              <SocialHub userName={userName} userAvatar={userAvatar} />
            </div>
          )}
        </div>

        {/* COLUMN 4: Persistent Auxiliary Panel (Sticky Radar Map or Social Feed) */}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
          {/* Always sticky radar map simulation */}
          <MapSimulation userLocationName={`${userNeighborhood}, ${userCity}`} />

          {/* Persistent Social feed preview when not on Social Tab */}
          {activeTab !== "social" && (
            <div className="row-anim">
              <SocialHub userName={userName} userAvatar={userAvatar} />
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full mt-auto py-6 border-t border-zinc-900/60 text-center text-[10px] text-zinc-600 font-semibold tracking-wider uppercase">
        © 2026 Plataforma Running Inc. Todos los derechos reservados.
      </footer>
    </div>
  );
}
