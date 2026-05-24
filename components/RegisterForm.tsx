"use client";

import React, { useState } from "react";
import { signUpUser, UserProfile } from "../lib/supabase";

interface RegisterFormProps {
  onSuccess: (profile: UserProfile) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  // Step navigation (1: Credentials, 2: Runner Details & Location)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  const [avatar, setAvatar] = useState("🏃‍♂️");
  const [level, setLevel] = useState<"Amateur" | "Profesional">("Amateur");
  const [neighborhood, setNeighborhood] = useState("Delicias");
  const [city, setCity] = useState("Bogotá");
  const [country] = useState("Colombia");

  // UI Flow States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const AVATARS = ["🏃‍♂️", "🏃‍♀️", "⚡", "🥇", "👟", "🔥", "🪐"];

  // Trigger geolocation visual simulation
  const handleSimulateGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      setIsLocating(false);
      setNeighborhood("Delicias");
      setCity("Bogotá");
    }, 1500);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    if (!name.trim()) {
      setErrorMessage("Por favor ingresa tu nombre de corredor.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Por favor ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await signUpUser(
        email,
        password,
        name,
        avatar,
        level,
        neighborhood,
        city,
        country
      );

      if (res.success && res.profile) {
        onSuccess(res.profile);
      } else {
        setErrorMessage(res.error || "No se pudo registrar la cuenta. Revisa tus datos.");
      }
    } catch (err) {
      setErrorMessage("Error crítico de red al registrarse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error alert */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-xl font-semibold leading-normal row-anim">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* STEP 1: CREDENTIALS */}
      {step === 1 && (
        <form onSubmit={handleNextStep} className="flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
              Nombre de Corredor
            </label>
            <input
              type="text"
              required
              placeholder="Ej. David Valenzuela"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
            />
          </div>

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

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="Min. 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[var(--brand-coral)] to-rose-500 hover:brightness-110 text-white font-bold py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-500/10 cursor-pointer transition-all mt-2"
          >
            Siguiente Paso: Mi Perfil ⚡
          </button>
        </form>
      )}

      {/* STEP 2: PROFILE DETAILS & LOCATION */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
          
          {/* Avatar Slider selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
              Elige tu Avatar
            </label>
            <div className="flex gap-2 justify-between bg-zinc-950/60 p-2 rounded-2xl border border-zinc-900">
              {AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    avatar === av
                      ? "bg-[var(--brand-coral)]/10 border-[var(--brand-coral)] text-white shadow-lg"
                      : "bg-zinc-900/40 border-transparent hover:border-zinc-800"
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Level selector (Pill shape) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
              Nivel de Corredor
            </label>
            <div className="flex gap-3 bg-zinc-950/60 p-1 rounded-2xl border border-zinc-900">
              {["Amateur", "Profesional"].map(lv => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(lv as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all uppercase ${
                    level === lv
                      ? "bg-zinc-800 text-white border border-zinc-700/40 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* Neighborhood & City Location Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                Barrio
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Delicias"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--brand-coral)] transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">
                Ciudad
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Bogotá"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[var(--brand-coral)] transition-all"
              />
            </div>
          </div>

          {/* GPS Looker pulse trigger */}
          <button
            type="button"
            onClick={handleSimulateGPS}
            className="w-full bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-900 text-[10px] font-bold uppercase tracking-wider text-zinc-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isLocating ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                Geolocalizando satélite...
              </>
            ) : (
              "🛰️ Detección por GPS (Ubicación Rápida)"
            )}
          </button>

          {/* Action Row */}
          <div className="flex gap-3 mt-1.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              Atrás
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[var(--brand-coral)] to-rose-500 hover:brightness-110 text-white font-bold py-3.5 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creando Perfil...
                </>
              ) : (
                "Crear Cuenta & Entrar 🏃‍♂️"
              )}
            </button>
          </div>

        </form>
      )}

      {/* Switch back to login link */}
      <div className="text-center text-xs text-zinc-500 mt-2 font-medium">
        ¿Ya tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-white hover:text-[var(--brand-coral)] font-bold transition-colors cursor-pointer"
        >
          Inicia Sesión
        </button>
      </div>
    </div>
  );
}
