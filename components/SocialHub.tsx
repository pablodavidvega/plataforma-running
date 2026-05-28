"use client";

import React, { useState, useEffect, useRef } from "react";

interface Meetup {
  id: string;
  title: string;
  distance: string;
  pace: string;
  time: string;
  creatorName: string;
  creatorAvatar: string;
  joinedCount: number;
  hasJoined: boolean;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isCurrentUser?: boolean;
}

const INITIAL_MEETUPS: Meetup[] = [
  {
    id: "m1",
    title: "Trote del fin de semana - Delicias",
    distance: "10 km",
    pace: "5:15 min/km",
    time: "Sábado 7:00 AM",
    creatorName: "Mateo Rodríguez",
    creatorAvatar: "👨‍🎨",
    joinedCount: 4,
    hasJoined: false
  },
  {
    id: "m2",
    title: "Cuestas y potencia (Cerros)",
    distance: "6 km",
    pace: "6:00 min/km",
    time: "Martes 6:30 PM",
    creatorName: "Valentina Gómez",
    creatorAvatar: "👩‍🎤",
    joinedCount: 2,
    hasJoined: true
  }
];

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "c1", sender: "Mateo Rodríguez", avatar: "👨‍🎨", content: "Hola a todos! ¿Quién se le mide a correr este sábado a las 7:00 AM por las cuestas de Delicias?", time: "09:40" },
  { id: "c2", sender: "Camilo Torres", avatar: "👨‍🚀", content: "¡Apuntadísimo! El ritmo de 5:15 me queda perfecto.", time: "09:42" },
  { id: "c3", sender: "Valentina Gómez", avatar: "👩‍🎤", content: "Yo voy también, llevo a una amiga. ¡Nos vemos en el parque principal!", time: "09:45" }
];

interface SocialHubProps {
  userName: string;
  userAvatar: string;
}

export default function SocialHub({ userName, userAvatar }: SocialHubProps) {
  const [meetups, setMeetups] = useState<Meetup[]>(INITIAL_MEETUPS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [activeSubTab, setActiveSubTab] = useState<"salidas" | "chat">("salidas");

  // Form states for creating a meetup
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDistance, setNewDistance] = useState("8 km");
  const [newPace, setNewPace] = useState("5:30 min/km");
  const [newTime, setNewTime] = useState("");

  // Chat input state
  const [chatInput, setChatInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === "chat" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeSubTab]);

  // Handle Joining Meetup
  const toggleJoinMeetup = (id: string) => {
    setMeetups(prev =>
      prev.map(m => {
        if (m.id === id) {
          return {
            ...m,
            hasJoined: !m.hasJoined,
            joinedCount: m.hasJoined ? m.joinedCount - 1 : m.joinedCount + 1
          };
        }
        return m;
      })
    );
  };

  // Handle creating meetup
  const handleCreateMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;

    const meetup: Meetup = {
      id: `m_${Date.now()}`,
      title: newTitle,
      distance: newDistance,
      pace: newPace,
      time: newTime,
      creatorName: userName,
      creatorAvatar: userAvatar,
      joinedCount: 1,
      hasJoined: true
    };

    setMeetups([meetup, ...meetups]);
    setNewTitle("");
    setNewTime("");
    setShowCreateModal(false);

    // Simulate community response in chat after scheduling a meetup
    setTimeout(() => {
      const responses = [
        "¡Uff, excelente entrenamiento propuesto! Cuenta conmigo.",
        "Qué buena ruta. Ya me uní en la pestaña de Salidas 👍",
        "Me queda un poco lejos pero intentaré llegar a tiempo."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const names = ["Camilo Torres", "Daniela Beltrán", "Andrés Silva"];
      const avatars = ["👨‍🚀", "👩‍⚕️", "👨‍🔧"];
      const rIdx = Math.floor(Math.random() * names.length);

      const botMessage: ChatMessage = {
        id: `c_bot_${Date.now()}`,
        sender: names[rIdx],
        avatar: avatars[rIdx],
        content: `Sobre tu salida "${newTitle}": ${randomResponse}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 2000);
  };

  // Handle sending chat message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `c_user_${Date.now()}`,
      sender: userName,
      avatar: userAvatar,
      content: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };

    setMessages(prev => [...prev, newMsg]);
    const currentInput = chatInput;
    setChatInput("");

    // Simulate smart replies to user messages (chatbot mock)
    setTimeout(() => {
      let replyContent = "¡Excelente trote! Hay que seguir sumando kilómetros localmente 💪";
      
      const lower = currentInput.toLowerCase();
      if (lower.includes("hola") || lower.includes("buenas")) {
        replyContent = `¡Hola ${userName}! ¿Qué tal el entrenamiento de hoy? 🏃‍♂️`;
      } else if (lower.includes("lluvia") || lower.includes("clima") || lower.includes("frio")) {
        replyContent = "Acá por Delicias está haciendo un poco de viento frío, ¡abríguense bien antes de salir! ❄️";
      } else if (lower.includes("ritmo") || lower.includes("velocidad")) {
        replyContent = "Ese ritmo suena fuerte. ¡El ranking local del barrio se está poniendo competitivo! 🔥";
      } else if (lower.includes("ruta") || lower.includes("donde")) {
        replyContent = "Por el sendero ecológico alto de Delicias es espectacular, muy recomendado y con buena cuesta.";
      }

      const botMsg: ChatMessage = {
        id: `c_reply_${Date.now()}`,
        sender: "Camilo Torres",
        avatar: "👨‍🚀",
        content: replyContent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col h-[420px] shadow-lg border-white/10">

      {/* Sub Tabs: Salidas vs Chat */}
      <div className="flex gap-2.5 mb-4 border-b border-white/[0.08] pb-3">
        <button
          onClick={() => setActiveSubTab("salidas")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex justify-center items-center gap-1.5 ${
            activeSubTab === "salidas"
              ? "bg-black/25 text-white border border-white/10"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          📅 Salidas Grupales
        </button>
        <button
          onClick={() => setActiveSubTab("chat")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all uppercase tracking-wide flex justify-center items-center gap-1.5 relative ${
            activeSubTab === "chat"
              ? "bg-black/25 text-white border border-white/10"
              : "text-white/50 hover:text-white/80"
          }`}
        >
          💬 Chat Local
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse-glow" />
        </button>
      </div>

      {/* Dynamic Sub-tab content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        
        {/* TAB 1: MEETUPS */}
        {activeSubTab === "salidas" && (
          <div className="flex flex-col gap-3 h-full">
            {/* Header + Schedule Button */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Entrenamientos Cerca
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[10px] bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] border border-[var(--brand-coral)]/30 hover:bg-[var(--brand-coral)]/20 transition-all font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide cursor-pointer"
              >
                + Crear Salida
              </button>
            </div>

            {/* List of Meetups */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3.5 pb-2">
              {meetups.map(meetup => (
                <div
                  key={meetup.id}
                  className="bg-black/[0.14] border border-white/[0.08] rounded-2xl p-4 flex flex-col gap-3 hover:border-white/[0.18] transition-all row-anim"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{meetup.creatorAvatar}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{meetup.title}</h4>
                        <span className="text-[9px] text-white/40">Por {meetup.creatorName}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/60 font-bold bg-black/25 border border-white/10 px-2 py-0.5 rounded-lg">
                      {meetup.time}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-black/[0.14] p-2 rounded-xl border border-white/[0.08]">
                    <span className="text-[10px] text-white/50">⚡ Ritmo: <strong className="text-white">{meetup.pace}</strong></span>
                    <span className="text-[10px] text-white/50">📏 Distancia: <strong className="text-white">{meetup.distance}</strong></span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-white/[0.08]">
                    <span className="text-[9px] text-white/40 font-medium">
                      👥 {meetup.joinedCount} corredores inscritos
                    </span>
                    <button
                      onClick={() => toggleJoinMeetup(meetup.id)}
                      className={`text-[10px] font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                        meetup.hasJoined
                          ? "bg-black/25 text-white/50 border border-white/10 hover:text-white"
                          : "bg-[var(--brand-coral)] hover:bg-[var(--brand-coral-hover)] text-white shadow-md shadow-orange-500/10"
                      }`}
                    >
                      {meetup.hasJoined ? "Inscrito ✓" : "Unirme"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CHAT COMUNITARIO */}
        {activeSubTab === "chat" && (
          <div className="flex flex-col h-full gap-3">
            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 pb-2">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] row-anim ${
                    msg.isCurrentUser ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  <span className="text-xl bg-black/25 w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                    {msg.avatar}
                  </span>

                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-white/80">
                        {msg.isCurrentUser ? "Tú" : msg.sender}
                      </span>
                      <span className="text-[8px] text-white/30 font-semibold">{msg.time}</span>
                    </div>

                    <div className={`text-xs px-3.5 py-2 rounded-2xl border ${
                      msg.isCurrentUser
                        ? "bg-[var(--brand-coral)]/10 border-[var(--brand-coral)]/30 text-white rounded-tr-none"
                        : "bg-black/20 border-white/[0.08] text-white/80 rounded-tl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
              <input
                type="text"
                placeholder="Escribe un mensaje en Delicias..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-[var(--input-bg)] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-[var(--brand-coral)] transition-all"
              />
              <button
                type="submit"
                className="bg-black/25 border border-white/10 hover:border-white/25 text-white px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Enviar
              </button>
            </form>
          </div>
        )}

      </div>

      {/* CREATE MEETUP MODAL (Simulated inside card layer) */}
      {showCreateModal && (
        <div className="absolute inset-0 bg-[rgba(40,43,55,0.97)] rounded-3xl p-5 z-40 border border-white/10 flex flex-col justify-between row-anim">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Programar Salida Grupal
            </h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-white/40 hover:text-white text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateMeetup} className="flex-1 flex flex-col gap-3 justify-center">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-white/40 font-bold uppercase">Título del entrenamiento</label>
              <input
                type="text"
                required
                placeholder="Ej. Trote suave matutino"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-[var(--input-bg)] border border-white/10 text-xs px-3 py-2 rounded-xl text-white placeholder-white/25 outline-none focus:border-[var(--brand-coral)]"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-white/40 font-bold uppercase">Distancia</label>
                <select
                  value={newDistance}
                  onChange={(e) => setNewDistance(e.target.value)}
                  className="bg-[var(--input-bg)] border border-white/10 text-xs px-2.5 py-2 rounded-xl text-white outline-none"
                >
                  <option value="5 km">5 km</option>
                  <option value="8 km">8 km</option>
                  <option value="10 km">10 km</option>
                  <option value="12 km">12 km</option>
                  <option value="15 km">15 km</option>
                  <option value="21 km">21 km</option>
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[9px] text-white/40 font-bold uppercase">Ritmo objetivo</label>
                <select
                  value={newPace}
                  onChange={(e) => setNewPace(e.target.value)}
                  className="bg-[var(--input-bg)] border border-white/10 text-xs px-2.5 py-2 rounded-xl text-white outline-none"
                >
                  <option value="4:30 min/km">4:30 /km (Rápido)</option>
                  <option value="5:00 min/km">5:00 /km (Medio)</option>
                  <option value="5:30 min/km">5:30 /km (Trote suave)</option>
                  <option value="6:00 min/km">6:00 /km (Trote recreativo)</option>
                  <option value="Libre">Libre / Regenerativo</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-white/40 font-bold uppercase">Fecha y Hora</label>
              <input
                type="text"
                required
                placeholder="Ej. Domingo 8:00 AM"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-[var(--input-bg)] border border-white/10 text-xs px-3 py-2 rounded-xl text-white placeholder-white/25 outline-none focus:border-[var(--brand-coral)]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral-hover)] text-white text-xs font-bold py-2.5 rounded-xl uppercase tracking-wider transition-all mt-2 cursor-pointer"
            >
              Publicar Salida Cerca
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
