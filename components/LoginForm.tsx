"use client";

import React, { useState } from "react";
import { signInUser, UserProfile } from "../lib/supabase";

interface LoginFormProps {
  onSuccess: (profile: UserProfile) => void;
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await signInUser(email, password);
      
      if (res.success && res.profile) {
        onSuccess(res.profile);
      } else {
        setErrorMessage(res.error || "Error al iniciar sesión. Inténtalo de nuevo.");
      }
    } catch (err) {
      setErrorMessage("Fallo crítico de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4.5">
      
      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-xl font-semibold leading-normal row-anim">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Email Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
          Correo Electrónico
        </label>
        <input
          type="email"
          required
          placeholder="ejemplo@correo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
        />
      </div>

      {/* Password Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-baseline">
          <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
            Contraseña
          </label>
          <button
            type="button"
            onClick={() => alert("Simulación: Ingresa de nuevo una cuenta ficticia o regístrate.")}
            className="text-[9px] text-[var(--brand-coral)] hover:underline font-bold"
          >
            ¿La olvidaste?
          </button>
        </div>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-[var(--brand-coral)] to-rose-500 hover:brightness-110 text-white font-bold py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-500/10 cursor-pointer transition-all disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verificando...
          </>
        ) : (
          "Ingresar a la Plataforma ⚡"
        )}
      </button>

      {/* Switch to Register link */}
      <div className="text-center text-xs text-zinc-500 mt-2 font-medium">
        ¿Aún no tienes cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-white hover:text-[var(--brand-coral)] font-bold transition-colors cursor-pointer"
        >
          Regístrate ahora
        </button>
      </div>

    </form>
  );
}
