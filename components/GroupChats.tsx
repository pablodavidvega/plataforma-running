"use client";

import React, { useState, useRef, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface ChatMember {
  id: string;
  name: string;
  avatar: string;
}

export interface GroupMessage {
  id: string;
  sender: string;
  avatar: string;
  content: string;
  time: string;
  isCurrentUser?: boolean;
}

export interface GroupChat {
  id: string;
  name: string;
  creatorName: string;
  members: ChatMember[];
  messages: GroupMessage[];
  unreadCount: number;
  lastMessage: string;
  lastTime: string;
  isCreatedByMe: boolean;
}

export interface SidebarChatInfo {
  id: string;
  name: string;
  memberAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────
export const AVAILABLE_RUNNERS = [
  { id: "r1", name: "Camilo Torres",    avatar: "👨‍🚀", pace: "4:15 min/km", neighborhood: "Delicias" },
  { id: "r2", name: "Valentina Gómez",  avatar: "👩‍🎤", pace: "4:45 min/km", neighborhood: "Delicias" },
  { id: "r3", name: "Mateo Rodríguez",  avatar: "👨‍🎨", pace: "3:55 min/km", neighborhood: "Delicias" },
  { id: "r4", name: "Sofía Martínez",   avatar: "👩‍💼", pace: "5:10 min/km", neighborhood: "Chicó" },
  { id: "r5", name: "Andrés Silva",     avatar: "👨‍🔧", pace: "4:30 min/km", neighborhood: "Las Américas" },
  { id: "r6", name: "Daniela Beltrán", avatar: "👩‍⚕️", pace: "4:20 min/km", neighborhood: "Delicias" },
  { id: "r7", name: "Carlos Mendoza",   avatar: "👨‍💼", pace: "5:00 min/km", neighborhood: "Usaquén" },
];

const INITIAL_CHATS: GroupChat[] = [
  {
    id: "g0",
    name: "Trail Delicias 🏔️",
    creatorName: "Mateo Rodríguez",
    members: [
      { id: "r3", name: "Mateo Rodríguez", avatar: "👨‍🎨" },
      { id: "r1", name: "Camilo Torres",   avatar: "👨‍🚀" },
      { id: "r6", name: "Daniela Beltrán", avatar: "👩‍⚕️" },
    ],
    messages: [
      {
        id: "gm0",
        sender: "Sistema",
        avatar: "🔔",
        content: 'Mateo Rodríguez te agregó al grupo "Trail Delicias 🏔️".',
        time: "08:15",
      },
      {
        id: "gm1",
        sender: "Mateo Rodríguez",
        avatar: "👨‍🎨",
        content: "¡Hola a todos! El plan es salir el sábado a las 6 AM desde el parque principal.",
        time: "08:20",
      },
      {
        id: "gm2",
        sender: "Camilo Torres",
        avatar: "👨‍🚀",
        content: "¡Confirmado! Llevo los geles de energía 💪",
        time: "08:45",
      },
    ],
    unreadCount: 2,
    lastMessage: "¡Confirmado! Llevo los geles de energía 💪",
    lastTime: "08:45",
    isCreatedByMe: false,
  },
];

// ─── Helper ─────────────────────────────────────────────────────────────────
const toSidebarInfo = (c: GroupChat): SidebarChatInfo => ({
  id: c.id,
  name: c.name,
  memberAvatar: c.members[0]?.avatar ?? "💬",
  lastMessage: c.lastMessage,
  lastTime: c.lastTime,
  unreadCount: c.unreadCount,
});

const REPLIES = [
  "¡Totalmente de acuerdo! 💪",
  "Excelente idea. Nos vemos en la ruta.",
  "El trail está en perfectas condiciones 🏔️",
  "Cuenten conmigo para el próximo entrenamiento 🏃‍♂️",
  "¡Sí, vamos! Ese ritmo me parece perfecto.",
  "Qué buena motivación. ¡Yo también me apunto!",
];

// ─── Props ───────────────────────────────────────────────────────────────────
interface GroupChatsProps {
  userName: string;
  userAvatar: string;
  selectedChatId: string | null;
  onNotify: (message: string) => void;
  onSidebarUpdate: (chats: SidebarChatInfo[]) => void;
  onClearSelectedChat: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function GroupChats({
  userName,
  userAvatar,
  selectedChatId,
  onNotify,
  onSidebarUpdate,
  onClearSelectedChat,
}: GroupChatsProps) {
  const [localChats, setLocalChats] = useState<GroupChat[]>(INITIAL_CHATS);
  const [view, setView] = useState<"list" | "chat" | "create">("list");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Create-group form
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  // Stable refs to avoid stale-closure issues in setTimeout / useEffect
  const localChatsRef = useRef(localChats);
  localChatsRef.current = localChats;
  const onSidebarUpdateRef = useRef(onSidebarUpdate);
  onSidebarUpdateRef.current = onSidebarUpdate;
  const onClearRef = useRef(onClearSelectedChat);
  onClearRef.current = onClearSelectedChat;

  // ── Open chat (also clears unread) ──────────────────────────────────────
  const openChat = (id: string) => {
    setActiveChatId(id);
    setView("chat");
    const newChats = localChatsRef.current.map(c =>
      c.id === id ? { ...c, unreadCount: 0 } : c
    );
    setLocalChats(newChats);
    onSidebarUpdateRef.current(newChats.map(toSidebarInfo));
  };

  // ── Handle sidebar click from parent ────────────────────────────────────
  useEffect(() => {
    if (!selectedChatId) return;
    openChat(selectedChatId);
    onClearRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChatId]);

  // ── Auto-scroll chat ─────────────────────────────────────────────────────
  useEffect(() => {
    if (view === "chat" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [view, activeChatId, localChats]);

  const activeChat = localChats.find(c => c.id === activeChatId);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeChatId || !activeChat) return;

    const msgTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: GroupMessage = {
      id: `gm_${Date.now()}`,
      sender: userName,
      avatar: userAvatar,
      content: messageInput,
      time: msgTime,
      isCurrentUser: true,
    };

    const chatId = activeChatId;
    const inputText = messageInput;
    const others = activeChat.members.filter(m => m.name !== userName);

    const newChats = localChats.map(c =>
      c.id === chatId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: inputText, lastTime: msgTime }
        : c
    );
    setLocalChats(newChats);
    onSidebarUpdateRef.current(newChats.map(toSidebarInfo));
    setMessageInput("");

    // Simulate reply from a group member
    if (others.length === 0) return;
    setTimeout(() => {
      const current = localChatsRef.current;
      const responder = others[Math.floor(Math.random() * others.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const replyMsg: GroupMessage = {
        id: `gm_r_${Date.now()}`,
        sender: responder.name,
        avatar: responder.avatar,
        content: REPLIES[Math.floor(Math.random() * REPLIES.length)],
        time: replyTime,
      };
      const updated = current.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, replyMsg], lastMessage: replyMsg.content, lastTime: replyTime }
          : c
      );
      setLocalChats(updated);
      onSidebarUpdateRef.current(updated.map(toSidebarInfo));
    }, 1500);
  };

  // ── Create group ──────────────────────────────────────────────────────────
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedMembers.length === 0) return;

    const addedMembers = AVAILABLE_RUNNERS
      .filter(r => selectedMembers.includes(r.id))
      .map(r => ({ id: r.id, name: r.name, avatar: r.avatar }));

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const systemMsg: GroupMessage = {
      id: `gm_sys_${Date.now()}`,
      sender: "Sistema",
      avatar: "🔔",
      content: `${userName} creó el grupo e invitó a ${addedMembers.map(m => m.name).join(", ")}.`,
      time: now,
    };

    const newChat: GroupChat = {
      id: `g_${Date.now()}`,
      name: newGroupName,
      creatorName: userName,
      members: [{ id: "me", name: userName, avatar: userAvatar }, ...addedMembers],
      messages: [systemMsg],
      unreadCount: 0,
      lastMessage: systemMsg.content,
      lastTime: now,
      isCreatedByMe: true,
    };

    const newChats = [newChat, ...localChats];
    setLocalChats(newChats);
    onSidebarUpdateRef.current(newChats.map(toSidebarInfo));

    const memberNames = addedMembers.map(m => m.name).join(", ");
    onNotify(`💬 Grupo "${newGroupName}" creado. Notificación enviada a: ${memberNames}`);

    setNewGroupName("");
    setSelectedMembers([]);
    setView("list");
    setTimeout(() => openChat(newChat.id), 120);
  };

  const toggleMember = (id: string) =>
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  // ════════════════════════════════════════════════════════════
  // RENDER — CREATE VIEW
  // ════════════════════════════════════════════════════════════
  if (view === "create") {
    return (
      <div className="glass-panel rounded-3xl p-5 flex flex-col gap-5 row-anim">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <button
            onClick={() => setView("list")}
            className="text-white/50 hover:text-white text-xs font-bold cursor-pointer transition-colors"
          >
            ← Volver
          </button>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">Nuevo Grupo de Chat</h3>
            <p className="text-[9px] text-white/40 mt-0.5">
              Los corredores seleccionados recibirán una notificación
            </p>
          </div>
        </div>

        <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
          {/* Group name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider">
              Nombre del Grupo
            </label>
            <input
              type="text"
              required
              placeholder='Ej. "Maratón Bogotá 2026 🏆"'
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              className="bg-[var(--input-bg)] border border-white/10 text-xs px-3.5 py-2.5 rounded-xl text-white placeholder-white/25 outline-none focus:border-[var(--brand-coral)] transition-all"
            />
          </div>

          {/* Runner selection */}
          <div className="flex flex-col gap-2">
            <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider flex justify-between">
              <span>Seleccionar Corredores</span>
              {selectedMembers.length > 0 && (
                <span className="text-[var(--brand-coral)] font-black">
                  {selectedMembers.length} seleccionado{selectedMembers.length !== 1 ? "s" : ""}
                </span>
              )}
            </label>

            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
              {AVAILABLE_RUNNERS.map(runner => {
                const sel = selectedMembers.includes(runner.id);
                return (
                  <button
                    key={runner.id}
                    type="button"
                    onClick={() => toggleMember(runner.id)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer text-left ${
                      sel
                        ? "bg-[var(--brand-coral)]/10 border-[var(--brand-coral)]/40"
                        : "bg-black/[0.14] border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl w-8 h-8 flex items-center justify-center rounded-xl bg-black/20 shrink-0">
                      {runner.avatar}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold truncate ${sel ? "text-white" : "text-white/80"}`}>
                        {runner.name}
                      </div>
                      <div className="text-[9px] text-white/40">
                        📍 {runner.neighborhood} · ⚡ {runner.pace}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        sel
                          ? "bg-[var(--brand-coral)] border-[var(--brand-coral)]"
                          : "border-white/25"
                      }`}
                    >
                      {sel && <span className="text-white text-[8px] font-black">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!newGroupName.trim() || selectedMembers.length === 0}
            className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral-hover)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold py-3 rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            💬 Crear Grupo & Notificar Corredores
          </button>
        </form>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER — CHAT VIEW
  // ════════════════════════════════════════════════════════════
  if (view === "chat" && activeChat) {
    return (
      <div className="glass-panel rounded-3xl p-5 flex flex-col row-anim" style={{ height: "520px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/[0.08]">
          <button
            onClick={() => { setView("list"); setActiveChatId(null); }}
            className="text-white/50 hover:text-white text-xs font-bold cursor-pointer transition-colors shrink-0"
          >
            ← Grupos
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-extrabold text-white truncate">{activeChat.name}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex gap-0.5">
                {activeChat.members.slice(0, 5).map(m => (
                  <span key={m.id} className="text-xs" title={m.name}>{m.avatar}</span>
                ))}
              </span>
              <span className="text-[9px] text-white/35">
                {activeChat.members.length} miembro{activeChat.members.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          {activeChat.isCreatedByMe && (
            <span className="text-[9px] bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] border border-[var(--brand-coral)]/30 px-2 py-0.5 rounded-full font-bold uppercase shrink-0">
              Admin
            </span>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 pb-2 min-h-0">
          {activeChat.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-2.5 row-anim ${
                msg.sender === "Sistema"
                  ? "self-center w-full"
                  : msg.isCurrentUser
                  ? "self-end flex-row-reverse max-w-[82%]"
                  : "self-start max-w-[82%]"
              }`}
            >
              {msg.sender !== "Sistema" && (
                <span className="text-xl bg-black/25 w-7 h-7 rounded-lg flex items-center justify-center border border-white/10 shrink-0">
                  {msg.avatar}
                </span>
              )}
              <div className="flex flex-col w-full">
                {!msg.isCurrentUser && msg.sender !== "Sistema" && (
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold text-white/70">{msg.sender}</span>
                    <span className="text-[8px] text-white/30">{msg.time}</span>
                  </div>
                )}
                <div
                  className={`text-xs border ${
                    msg.sender === "Sistema"
                      ? "px-3 py-1.5 rounded-xl bg-black/[0.14] border-white/[0.08] text-white/40 text-[10px] italic text-center w-full"
                      : msg.isCurrentUser
                      ? "px-3.5 py-2 rounded-2xl rounded-tr-none bg-[var(--brand-coral)]/10 border-[var(--brand-coral)]/30 text-white"
                      : "px-3.5 py-2 rounded-2xl rounded-tl-none bg-black/20 border-white/[0.08] text-white/85"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.isCurrentUser && (
                  <span className="text-[8px] text-white/30 self-end mt-0.5">{msg.time}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-2 pt-3 border-t border-white/[0.08]">
          <input
            type="text"
            placeholder={`Mensaje en ${activeChat.name}…`}
            value={messageInput}
            onChange={e => setMessageInput(e.target.value)}
            className="flex-1 bg-[var(--input-bg)] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/25 outline-none focus:border-[var(--brand-coral)] transition-all"
          />
          <button
            type="submit"
            className="bg-[var(--brand-coral)] hover:bg-[var(--brand-coral-hover)] text-white px-4 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            ➤
          </button>
        </form>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER — CHAT LIST (default)
  // ════════════════════════════════════════════════════════════
  const myChats    = localChats.filter(c => c.isCreatedByMe);
  const addedChats = localChats.filter(c => !c.isCreatedByMe);
  const totalUnread = localChats.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="glass-panel rounded-3xl p-5 flex flex-col gap-5 row-anim">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-white tracking-tight">Mis Grupos</h3>
            {totalUnread > 0 && (
              <span className="bg-[var(--brand-coral)] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalUnread}
              </span>
            )}
          </div>
          <p className="text-[9px] text-white/40 mt-0.5">
            {localChats.length} chat{localChats.length !== 1 ? "s" : ""} activo{localChats.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setView("create")}
          className="text-[10px] bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] border border-[var(--brand-coral)]/30 hover:bg-[var(--brand-coral)]/20 font-bold px-3 py-1.5 rounded-xl uppercase tracking-wide cursor-pointer transition-all flex items-center gap-1.5"
        >
          + Nuevo Grupo
        </button>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">
        {/* Chats I was added to */}
        {addedChats.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider px-1">
              🔔 Te agregaron
            </span>
            {addedChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} onClick={() => openChat(chat.id)} />
            ))}
          </div>
        )}

        {/* Chats I created */}
        {myChats.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider px-1">
              👑 Creados por ti
            </span>
            {myChats.map(chat => (
              <ChatListItem key={chat.id} chat={chat} onClick={() => openChat(chat.id)} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {localChats.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-3">💬</p>
            <p className="text-xs font-bold text-white/50">Aún no tienes grupos</p>
            <p className="text-[10px] text-white/30 mt-1">
              Crea uno e invita a tus compañeros de ruta
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component: Chat list item ──────────────────────────────────────────
function ChatListItem({ chat, onClick }: { chat: GroupChat; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-black/[0.14] border border-white/[0.08] hover:border-white/[0.18] hover:bg-black/[0.20] transition-all cursor-pointer text-left"
    >
      {/* Avatar of first member */}
      <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center text-lg shrink-0">
        {chat.members[0]?.avatar ?? "💬"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-white truncate">{chat.name}</span>
          <span className="text-[9px] text-white/30 shrink-0">{chat.lastTime}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-[10px] text-white/40 truncate">{chat.lastMessage}</span>
          {chat.unreadCount > 0 && (
            <span className="shrink-0 bg-[var(--brand-coral)] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {chat.unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 mt-1">
          {chat.members.slice(0, 5).map(m => (
            <span key={m.id} className="text-[11px]" title={m.name}>{m.avatar}</span>
          ))}
          {chat.members.length > 5 && (
            <span className="text-[9px] text-white/30 ml-0.5">+{chat.members.length - 5}</span>
          )}
          <span className="text-[9px] text-white/30 ml-1">
            {chat.members.length} miembro{chat.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </button>
  );
}
