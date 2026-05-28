"use client";

import React, { useState, useEffect } from "react";
import MapSimulation from "../components/MapSimulation";
import DashboardStats from "../components/DashboardStats";
import Leaderboards from "../components/Leaderboards";
import SocialHub from "../components/SocialHub";
import GroupChats, { SidebarChatInfo } from "../components/GroupChats";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import { getCurrentSession, signOutUser, UserProfile, isSupabaseConfigured } from "../lib/supabase";

// Pre-seed the sidebar with the initial group chat (matches GroupChats INITIAL_CHATS)
const INITIAL_SIDEBAR_CHATS: SidebarChatInfo[] = [
  {
    id: "g0",
    name: "Trail Delicias 🏔️",
    memberAvatar: "👨‍🎨",
    lastMessage: "¡Confirmado! Llevo los geles de energía 💪",
    lastTime: "08:45",
    unreadCount: 2,
  },
];

export default function Home() {
  // App Navigation & Session Views
  const [view, setView]           = useState<"loading" | "login" | "register" | "dashboard">("loading");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Dashboard main tabs
  const [activeTab, setActiveTab] = useState<"stats" | "rankings" | "social" | "chats">("stats");

  // Alerts / toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sidebar chat list (synced from GroupChats component)
  const [sidebarChats, setSidebarChats] = useState<SidebarChatInfo[]>(INITIAL_SIDEBAR_CHATS);

  // When user clicks a chat in the sidebar → open GroupChats to that chat
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg: string, duration = 5000) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), duration);
  };

  // ── 1. Fetch existing session on mount ───────────────────────────────────
  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getCurrentSession();
        if (session) {
          setUserProfile(session);
          setView("dashboard");
          showToast(`⚡ ¡Bienvenido de nuevo, ${session.name}! Sesión reanudada.`, 4000);
          // Simulate the "you were added to a group" notification after welcome
          setTimeout(() => {
            showToast('🔔 Mateo Rodríguez te agregó al grupo "Trail Delicias 🏔️". ¡Ve a Mis Grupos!', 6000);
          }, 5000);
        } else {
          setView("login");
        }
      } catch {
        setView("login");
      }
    }
    checkSession();
  }, []);

  // ── 2. Handle Login / Register success ───────────────────────────────────
  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setView("dashboard");
    showToast(`🎉 ¡Acceso concedido! Bienvenido, ${profile.name}.`, 4000);
    setTimeout(() => {
      showToast('🔔 Mateo Rodríguez te agregó al grupo "Trail Delicias 🏔️". ¡Ve a Mis Grupos!', 6000);
    }, 5000);
  };

  // ── 3. Handle Sign Out ────────────────────────────────────────────────────
  const handleSignOut = async () => {
    setView("loading");
    await signOutUser();
    setUserProfile(null);
    setActiveTab("stats");
    setSelectedChatId(null);
    setView("login");
  };

  // ── 4. Score notification from Leaderboards ───────────────────────────────
  const handleScoreAdded = (raceName: string, time: string) => {
    showToast(`🏆 ¡Score registrado! Completaste "${raceName}" en ${time}. ¡Ranking actualizado!`, 5000);
  };

  // ── 5. GroupChats → sidebar sync ─────────────────────────────────────────
  const handleSidebarUpdate = (chats: SidebarChatInfo[]) => {
    setSidebarChats(chats);
  };

  const handleGroupNotify = (message: string) => {
    showToast(message, 6000);
  };

  const handleClearSelectedChat = () => setSelectedChatId(null);

  // ── Sidebar: click on a chat item ─────────────────────────────────────────
  const openChatFromSidebar = (chatId: string) => {
    setActiveTab("chats");
    setSelectedChatId(chatId);
    // Clear unread in sidebar immediately
    setSidebarChats(prev =>
      prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c)
    );
  };

  // ── Total unread badge ────────────────────────────────────────────────────
  const totalUnread = sidebarChats.reduce((sum, c) => sum + c.unreadCount, 0);

  // ═════════════════════════════════════════════════════════════
  // RENDER BLOCKS
  // ═════════════════════════════════════════════════════════════

  // A. Loading screen
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
            <p className="text-xs text-white/50 font-extrabold uppercase tracking-widest">
              Sincronizando perfiles de running…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // B. Login Screen
  if (view === "login") {
    return (
      <AuthLayout subtitle="Ingresa a tu cuenta de corredor">
        <LoginForm onSuccess={handleAuthSuccess} onSwitchToRegister={() => setView("register")} />
      </AuthLayout>
    );
  }

  // C. Register Screen
  if (view === "register") {
    return (
      <AuthLayout subtitle="Crea tu perfil de corredor mundial">
        <RegisterForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setView("login")} />
      </AuthLayout>
    );
  }

  // D. Main Dashboard
  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col relative overflow-x-hidden font-sans">

      {/* Background glows */}
      <div className="absolute top-0 right-0 w-[45%] h-[45%] rounded-full bg-orange-500/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[45%] h-[45%] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 glass-panel border-[var(--brand-coral)]/30 rounded-2xl p-4 max-w-sm shadow-2xl flex items-start gap-3 w-[320px] row-anim glow-coral">
          <span className="text-xl">🔔</span>
          <div className="flex-1 text-left">
            <h4 className="text-xs font-bold text-white">Notificación KIPRUN</h4>
            <p className="text-[10px] text-white/60 mt-1 leading-normal">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/30 hover:text-white text-xs cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* ── COLUMN 1: Sidebar ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-5 lg:sticky lg:top-6">

          {/* Logo */}
          <div className="flex items-center gap-3 px-2">
            <span className="text-2xl bg-gradient-to-tr from-[var(--brand-coral)] to-rose-500 w-10 h-10 rounded-xl flex items-center justify-center text-white border border-white/10 shadow-lg shadow-orange-500/20">
              ⚡
            </span>
            <div>
              <h2 className="text-lg font-black tracking-tighter uppercase leading-none text-white">
                KIP<span className="text-[var(--brand-coral)]">RUN</span>
              </h2>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-0.5 inline-block">
                Geo-Rankings v1.2
              </span>
            </div>
          </div>

          {/* Profile Card */}
          {userProfile && (
            <div className="glass-panel rounded-3xl p-5 border-white/10">
              <div className="flex items-center gap-3.5">
                <span className="text-3xl bg-black/25 w-12 h-12 rounded-xl flex items-center justify-center border border-white/10">
                  {userProfile.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{userProfile.name}</h3>
                  <p className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5 font-medium truncate">
                    <span>📍 {userProfile.neighborhood}</span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-white/35">{userProfile.city}</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/[0.08] flex justify-between items-center text-[10px] font-bold">
                <span className="text-white/35 uppercase tracking-wider">
                  {isSupabaseConfigured ? "Supabase Cloud" : "Almacén Local"}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Activo
                </span>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-col gap-1.5 bg-black/20 p-2 rounded-2xl border border-white/10">
            {[
              { id: "stats",    label: "📊 Mi Dashboard",       desc: "Estadísticas y carga física" },
              { id: "rankings", label: "🏆 Rankings de Carrera", desc: "Local, Ciudad, País y Global" },
              { id: "social",   label: "🏃 Comunidad & Salidas", desc: "Meetups y chat local" },
              { id: "chats",    label: "💬 Mis Grupos",          desc: "Chats privados y grupales",
                badge: totalUnread > 0 ? totalUnread : undefined },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-black/25 border border-white/10 text-white shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold">{tab.label}</div>
                  {"badge" in tab && tab.badge !== undefined && (
                    <span className="bg-[var(--brand-coral)] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-white/35 mt-0.5">{tab.desc}</div>
              </button>
            ))}

            {/* Logout */}
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/5 transition-all mt-1 cursor-pointer font-bold text-xs flex items-center gap-2"
            >
              🚪 Cerrar Sesión
            </button>
          </div>

          {/* ── Mis Grupos (sidebar preview) ─────────────────────────────── */}
          {sidebarChats.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
                  Chats Recientes
                </span>
                {totalUnread > 0 && (
                  <span className="text-[9px] bg-[var(--brand-coral)] text-white font-black px-1.5 py-0.5 rounded-full">
                    {totalUnread} nuevo{totalUnread !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {sidebarChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => openChatFromSidebar(chat.id)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-black/[0.14] border border-white/[0.08] hover:border-white/[0.16] hover:bg-black/[0.20] transition-all cursor-pointer text-left"
                  >
                    <span className="text-base shrink-0">{chat.memberAvatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-white truncate">{chat.name}</div>
                      <div className="text-[9px] text-white/40 truncate">{chat.lastMessage}</div>
                    </div>
                    {chat.unreadCount > 0 && (
                      <span className="shrink-0 bg-[var(--brand-coral)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="hidden lg:block px-4 py-3.5 rounded-2xl bg-black/[0.14] border border-white/[0.08] text-[10px] text-white/45 leading-relaxed font-semibold">
            ⚡ <strong>Estadísticas Activas:</strong> Los rankings se agrupan en tiempo real según las coordenadas de{" "}
            {userProfile?.neighborhood || "Delicias"}.
          </div>
        </div>

        {/* ── COLUMN 2+3: Active Tab ────────────────────────────────────── */}
        {userProfile && (
          <div className="lg:col-span-2 flex flex-col gap-6">
            {activeTab === "stats" && (
              <div className="flex flex-col gap-6 row-anim">
                <DashboardStats userId={userProfile.id} />
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
            {activeTab === "chats" && (
              <div className="flex flex-col gap-6 row-anim">
                <GroupChats
                  userName={userProfile.name}
                  userAvatar={userProfile.avatar}
                  selectedChatId={selectedChatId}
                  onNotify={handleGroupNotify}
                  onSidebarUpdate={handleSidebarUpdate}
                  onClearSelectedChat={handleClearSelectedChat}
                />
              </div>
            )}
          </div>
        )}

        {/* ── COLUMN 4: Map + Social (persistent) ──────────────────────── */}
        {userProfile && (
          <div className="lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-6">
            <MapSimulation userLocationName={`${userProfile.neighborhood}, ${userProfile.city}`} />
            {activeTab !== "social" && activeTab !== "chats" && (
              <div className="row-anim">
                <SocialHub userName={userProfile.name} userAvatar={userProfile.avatar} />
              </div>
            )}
          </div>
        )}

      </div>

      <footer className="w-full mt-auto py-6 border-t border-white/[0.08] text-center text-[10px] text-white/35 font-semibold tracking-wider uppercase">
        © 2026 KIPRUN Inc. — Todos los derechos reservados.
      </footer>
    </div>
  );
}
