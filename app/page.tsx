"use client";

import React, { useState, useEffect } from "react";
import MapSimulation from "../components/MapSimulation";
import DashboardStats from "../components/DashboardStats";
import Leaderboards from "../components/Leaderboards";
import SocialHub from "../components/SocialHub";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { getCurrentSession, signOutUser, UserProfile, isSupabaseConfigured } from "../lib/supabase";

export default function Home() {
  // App Navigation & Session Views ("loading" | "login" | "register" | "dashboard")
  const [view, setView] = useState<"loading" | "login" | "register" | "dashboard">("loading");

  // Logged-in User Profile Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Dashboard layout active tab ("stats" | "rankings" | "social")
  const [activeTab, setActiveTab] = useState<"stats" | "rankings" | "social">("stats");

  // Alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Fetch existing session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (session) {
          setUserProfile(session);
          setView("dashboard");
          
          setToastMessage(`⚡ ¡Bienvenido de nuevo, ${session.name}! Sesión reanudada.`);
          setTimeout(() => setToastMessage(null), 4000);
        } else {
          setView("login");
        }
      } catch (err) {
        setView("login");
      }
    }
    checkSession();
  }, []);

  // 2. Handle Login / Register Success
  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setView("dashboard");
    
    setToastMessage(`🎉 ¡Acceso concedido! Bienvenido, ${profile.name}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 3. Handle Sign Out
  const handleSignOut = async () => {
    setView("loading");
    await signOutUser();
    setUserProfile(null);
    setActiveTab("stats");
    setView("login");
  };

  // Callback when a user updates their leaderboard score
  const handleScoreAdded = (raceName: string, time: string) => {
    setToastMessage(`🏆 ¡Score registrado! Completaste "${raceName}" en ${time}. ¡Ranking actualizado!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // ==========================================
  // RENDER BLOCKS
  // ==========================================

  // A. Loading screen spinner
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="flex flex-col items-center gap-4 relative z-10 text-center">
          <span className="text-3xl bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 w-14 h-14 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-lg animate-bounce">
            ⚡
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 bg-[var(--brand-coral)] rounded-full animate-ping" />
            <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">
              Sincronizando perfiles de running...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // B. Login Screen wrapper
  if (view === "login") {
    return (
      <AuthLayout subtitle="Ingresa a tu cuenta de corredor">
        <LoginForm
          onSuccess={handleAuthSuccess}
          onSwitchToRegister={() => setView("register")}
        />
      </AuthLayout>
    );
  }

  // C. Register Screen wrapper
  if (view === "register") {
    return (
      <AuthLayout subtitle="Crea tu perfil de corredor mundial">
        <RegisterForm
          onSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setView("login")}
        />
      </AuthLayout>
    );
  }

  // D. Main Application Dashboard
  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col relative overflow-x-hidden font-sans">
      
      {/* Visual background glows */}
      <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-full bg-orange-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

      {/* Global Toast Alert banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 glass-panel border-[var(--brand-coral)]/30 rounded-2xl p-4 max-w-sm shadow-2xl flex items-start gap-3 w-[320px] row-anim glow-coral">
          <span className="text-xl">🏆</span>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-bold text-white">Notificación del Sistema</h4>
            <p className="text-[10px] text-zinc-400 mt-1 leading-normal">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-600 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* COLUMN 1: Profile card & Tab navigation bar */}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
          
          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-2xl bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg shadow-orange-500/20">
              ⚡
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tighter uppercase leading-none text-white">
                PLATA<span className="text-[var(--brand-coral)]">RUN</span>
              </h2>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 inline-block">
                Geo-Rankings v1.2
              </span>
            </div>
          </div>

          {/* Connected Profile Card */}
          {userProfile && (
            <div className="glass-panel rounded-3xl p-5 border-zinc-800/80">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl bg-zinc-900 w-12 h-12 rounded-xl flex items-center justify-center border border-zinc-800/60">
                  {userProfile.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{userProfile.name}</h3>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                    <span>📍 {userProfile.neighborhood}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-zinc-500">{userProfile.city}</span>
                  </p>
                </div>
              </div>

              {/* Status information & dynamic database badge */}
              <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold">
                <span className="text-zinc-500 uppercase tracking-wider">
                  {isSupabaseConfigured ? "Supabase Cloud" : "Almacén Local"}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Activo
                </span>
              </div>
            </div>
          )}

          {/* Navigation Options */}
          <div className="flex flex-col gap-1.5 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-900/60">
            {[
              { id: "stats", label: "📊 Mi Dashboard", desc: "Estadísticas y carga física" },
              { id: "rankings", label: "🏆 Rankings de Carrera", desc: "Local, Ciudad, País y Global" },
              { id: "social", label: "💬 Comunidad & Salidas", desc: "Mensajes y salidas grupales" }
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

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/5 transition-all mt-2 cursor-pointer font-bold text-xs flex items-center gap-2"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          <div className="hidden lg:block p-4.5 rounded-2xl bg-zinc-950/20 border border-zinc-900 text-[10px] text-zinc-500 leading-relaxed font-semibold">
            ⚡ <strong>Estadísticas Activas:</strong> Los rankings se agrupan en tiempo real según las coordenadas de {userProfile?.neighborhood || "Delicias"}.
          </div>
        </div>

        {/* COLUMN 2 & 3: Active Tab view */}
        {userProfile && (
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeTab === "stats" && (
              <div className="flex flex-col gap-6 row-anim">
                <DashboardStats />
              </div>
            )}

            {activeTab === "rankings" && (
              <div className="flex flex-col gap-6 row-anim">
                <Leaderboards
                  userName={userProfile.name}
                  userAvatar={userProfile.avatar}
                  userNeighborhood={userProfile.neighborhood}
                  userCity={userProfile.city}
                  userCountry={userProfile.country}
                  onScoreAdded={handleScoreAdded}
                />
              </div>
            )}

            {activeTab === "social" && (
              <div className="flex flex-col gap-6 row-anim">
                <SocialHub userName={userProfile.name} userAvatar={userProfile.avatar} />
              </div>
            )}
          </div>
        )}

        {/* COLUMN 4: persistent radar map view */}
        {userProfile && (
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
            <MapSimulation userLocationName={`${userProfile.neighborhood}, ${userProfile.city}`} />

            {activeTab !== "social" && (
              <div className="row-anim">
                <SocialHub userName={userProfile.name} userAvatar={userProfile.avatar} />
              </div>
            )}
          </div>
        )}

      </div>

      <footer className="w-full mt-auto py-6 border-t border-zinc-900/60 text-center text-[10px] text-zinc-600 font-semibold tracking-wider uppercase">
        © 2026 Plataforma Running Inc. Todos los derechos reservados.
      </footer>
    </div>
  );
}
