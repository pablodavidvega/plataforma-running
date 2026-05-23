"use client";

import React, { useState, useMemo } from "react";

interface RunnerRecord {
  id: string;
  name: string;
  avatar: string;
  timeSeconds: number;
  timeFormatted: string;
  location: string; // "Barrio, Ciudad"
  country: string;
  isCurrentUser?: boolean;
}

interface Race {
  id: string;
  name: string;
  category: "pista" | "trail";
  distance: string;
  location: string;
  country: string;
  difficulty: "Fácil" | "Moderado" | "Difícil" | "Extremo";
  description: string;
  // Leaderboard lists by levels for simulation
  participants: RunnerRecord[];
}

const INITIAL_RACES: Race[] = [
  {
    id: "race1",
    name: "5K Colina Delicias",
    category: "trail",
    distance: "5 km",
    location: "Delicias, Bogotá",
    country: "Colombia",
    difficulty: "Moderado",
    description: "Carrera técnica que bordea la parte alta del cerro de Delicias, ideal para corredores locales de la zona.",
    participants: [
      { id: "p1", name: "Mateo Rodríguez", avatar: "👨‍🎨", timeSeconds: 1195, timeFormatted: "19:55", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p2", name: "Camilo Torres", avatar: "👨‍🚀", timeSeconds: 1275, timeFormatted: "21:15", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p3", name: "Daniela Beltrán", avatar: "👩‍⚕️", timeSeconds: 1300, timeFormatted: "21:40", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p4", name: "Andrés Silva", avatar: "👨‍🔧", timeSeconds: 1390, timeFormatted: "23:10", location: "Las Américas, Bogotá", country: "Colombia" },
      { id: "p5", name: "Carolina Mendoza", avatar: "👩‍🌾", timeSeconds: 1540, timeFormatted: "25:40", location: "Chicó, Bogotá", country: "Colombia" },
      { id: "p6", name: "Jean-Pierre Blanc", avatar: "👨‍🍳", timeSeconds: 1150, timeFormatted: "19:10", location: "Chamonix", country: "Francia" }
    ]
  },
  {
    id: "race2",
    name: "Chicaque Trail 21K",
    category: "trail",
    distance: "21 km",
    location: "Soacha, Cundinamarca",
    country: "Colombia",
    difficulty: "Extremo",
    description: "Una de las carreras de montaña más exigentes por los bosques de niebla del Parque Chicaque.",
    participants: [
      { id: "p7", name: "Esteban Higuita", avatar: "👨‍🌾", timeSeconds: 6120, timeFormatted: "01:42:00", location: "Medellín, Antioquia", country: "Colombia" },
      { id: "p8", name: "Mateo Rodríguez", avatar: "👨‍🎨", timeSeconds: 6480, timeFormatted: "01:48:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p9", name: "Valentina Gómez", avatar: "👩‍🎤", timeSeconds: 6990, timeFormatted: "01:56:30", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p10", name: "John Miller", avatar: "👨‍🏫", timeSeconds: 5800, timeFormatted: "01:36:40", location: "Boulder, Colorado", country: "EEUU" },
      { id: "p11", name: "Sofía Martínez", avatar: "👩‍💼", timeSeconds: 7800, timeFormatted: "02:10:00", location: "Delicias, Bogotá", country: "Colombia" }
    ]
  },
  {
    id: "race3",
    name: "Media Maratón de Bogotá 21K",
    category: "pista",
    distance: "21 km",
    location: "Bogotá",
    country: "Colombia",
    difficulty: "Moderado",
    description: "La carrera de calle más importante del país y de Latinoamérica, a 2.600 metros de altura sobre el nivel del mar.",
    participants: [
      { id: "p12", name: "Kipchoge Simotwo", avatar: "🏃🏿‍♂️", timeSeconds: 3720, timeFormatted: "01:02:00", location: "Eldoret", country: "Kenia" },
      { id: "p13", name: "Camilo Torres", avatar: "👨‍🚀", timeSeconds: 4740, timeFormatted: "01:19:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p14", name: "Mateo Rodríguez", avatar: "👨‍🎨", timeSeconds: 5040, timeFormatted: "01:24:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p15", name: "Carlos Mendoza", avatar: "👨‍💼", timeSeconds: 5280, timeFormatted: "01:28:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p16", name: "Laura Restrepo", avatar: "👩‍💻", timeSeconds: 4980, timeFormatted: "01:23:00", location: "Poblado, Medellín", country: "Colombia" }
    ]
  },
  {
    id: "race4",
    name: "10K Nocturna Bogotá",
    category: "pista",
    distance: "10 km",
    location: "Bogotá",
    country: "Colombia",
    difficulty: "Fácil",
    description: "Carrera recreativa nocturna con un ambiente lleno de luces e hidratación, ideal para pulverizar marcas personales de velocidad.",
    participants: [
      { id: "p17", name: "Daniela Beltrán", avatar: "👩‍⚕️", timeSeconds: 2460, timeFormatted: "41:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p18", name: "Valentina Gómez", avatar: "👩‍🎤", timeSeconds: 2700, timeFormatted: "45:00", location: "Delicias, Bogotá", country: "Colombia" },
      { id: "p19", name: "Andrés Silva", avatar: "👨‍🔧", timeSeconds: 2600, timeFormatted: "43:20", location: "Las Américas, Bogotá", country: "Colombia" },
      { id: "p20", name: "Yuki Tanaka", avatar: "👨‍💼", timeSeconds: 2120, timeFormatted: "35:20", location: "Shinjuku, Tokio", country: "Japón" }
    ]
  }
];

interface LeaderboardsProps {
  userName: string;
  userAvatar: string;
  userNeighborhood: string;
  userCity: string;
  userCountry: string;
  onScoreAdded?: (raceName: string, time: string) => void;
}

export default function Leaderboards({
  userName,
  userAvatar,
  userNeighborhood,
  userCity,
  userCountry,
  onScoreAdded
}: LeaderboardsProps) {
  const [activeCategory, setActiveCategory] = useState<"trail" | "pista">("trail");
  const [searchQuery, setSearchQuery] = useState("");
  const [races, setRaces] = useState<Race[]>(INITIAL_RACES);
  const [selectedRaceId, setSelectedRaceId] = useState<string>("race1");
  const [activeLevel, setActiveLevel] = useState<"local" | "ciudad" | "pais" | "global">("local");

  // Score Input form states
  const [inputMin, setInputMin] = useState("");
  const [inputSec, setInputSec] = useState("");
  const [inputHour, setInputHour] = useState("0");
  const [formError, setFormError] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);

  // Computed: Selected Race
  const selectedRace = useMemo(() => {
    return races.find(r => r.id === selectedRaceId) || races[0];
  }, [races, selectedRaceId]);

  // Computed: Filtered races by category & query
  const filteredRaces = useMemo(() => {
    return races.filter(race => {
      const matchCat = race.category === activeCategory;
      const matchQuery = race.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         race.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [races, activeCategory, searchQuery]);

  // Compute Ranking Leaderboard List based on level select
  const rankingList = useMemo(() => {
    if (!selectedRace) return [];

    let runners = [...selectedRace.participants];

    // Filter runners according to hierarchy level
    if (activeLevel === "local") {
      // Show runners in the same neighborhood (Delicias) or near within Bogotá
      runners = runners.filter(r => r.location.toLowerCase().includes(userNeighborhood.toLowerCase()) || r.isCurrentUser);
    } else if (activeLevel === "ciudad") {
      // Show runners in the same city (Bogotá)
      runners = runners.filter(r => r.location.toLowerCase().includes(userCity.toLowerCase()) || r.isCurrentUser);
    } else if (activeLevel === "pais") {
      // Show runners in the same country (Colombia)
      runners = runners.filter(r => r.country.toLowerCase() === userCountry.toLowerCase() || r.isCurrentUser);
    } // Global shows all runners

    // Sort by fastest time (ascending seconds)
    return runners.sort((a, b) => a.timeSeconds - b.timeSeconds);
  }, [selectedRace, activeLevel, userNeighborhood, userCity, userCountry]);

  // Handle Score submission
  const handleAddScore = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const minutes = parseInt(inputMin);
    const seconds = parseInt(inputSec || "0");
    const hours = parseInt(inputHour || "0");

    if (isNaN(minutes) || minutes < 0 || minutes >= 60) {
      setFormError("Por favor ingresa minutos válidos (0-59).");
      return;
    }
    if (isNaN(seconds) || seconds < 0 || seconds >= 60) {
      setFormError("Por favor ingresa segundos válidos (0-59).");
      return;
    }
    if (hours === 0 && minutes === 0 && seconds === 0) {
      setFormError("El tiempo no puede ser cero.");
      return;
    }

    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const formatted = hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Update state to include user score
    setRaces(prevRaces => {
      return prevRaces.map(race => {
        if (race.id === selectedRace.id) {
          // Remove existing user score if they already submitted before
          const filteredParticipants = race.participants.filter(p => !p.isCurrentUser);
          
          const userParticipant: RunnerRecord = {
            id: "current_user",
            name: userName,
            avatar: userAvatar,
            timeSeconds: totalSeconds,
            timeFormatted: formatted,
            location: `${userNeighborhood}, ${userCity}`,
            country: userCountry,
            isCurrentUser: true
          };

          return {
            ...race,
            participants: [...filteredParticipants, userParticipant]
          };
        }
        return race;
      });
    });

    // Notify parent if callback exists
    if (onScoreAdded) {
      onScoreAdded(selectedRace.name, formatted);
    }

    // Reset fields & trigger a nice rank elevation success animation
    setInputMin("");
    setInputSec("");
    setInputHour("0");
    setSuccessAnimation(true);
    setTimeout(() => setSuccessAnimation(false), 2000);
  };

  // Find user's current rank position in the visible list
  const userRankPosition = useMemo(() => {
    const idx = rankingList.findIndex(r => r.isCurrentUser);
    return idx !== -1 ? idx + 1 : null;
  }, [rankingList]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Column 1: Race Selector & Search */}
      <div className="lg:col-span-1 glass-panel rounded-3xl p-5 flex flex-col h-[520px]">
        {/* Toggle Pista vs Trail */}
        <div className="flex gap-2 mb-4 bg-zinc-950/60 p-1.5 rounded-2xl border border-zinc-900/60">
          <button
            onClick={() => {
              setActiveCategory("trail");
              // Auto-select first trail race
              const firstTrail = INITIAL_RACES.find(r => r.category === "trail");
              if (firstTrail) setSelectedRaceId(firstTrail.id);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all uppercase flex justify-center items-center gap-1.5 ${
              activeCategory === "trail"
                ? "bg-[var(--brand-coral)] text-white shadow-lg shadow-orange-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            ⛰️ Trail
          </button>
          <button
            onClick={() => {
              setActiveCategory("pista");
              // Auto-select first pista race
              const firstPista = INITIAL_RACES.find(r => r.category === "pista");
              if (firstPista) setSelectedRaceId(firstPista.id);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all uppercase flex justify-center items-center gap-1.5 ${
              activeCategory === "pista"
                ? "bg-[var(--brand-coral)] text-white shadow-lg shadow-orange-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            🏃‍♂️ Pista
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar carreras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[var(--brand-coral)] transition-all"
          />
          <span className="absolute right-3.5 top-3 text-zinc-500 text-xs">🔍</span>
        </div>

        {/* Race scrollable list */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
          {filteredRaces.length > 0 ? (
            filteredRaces.map(race => {
              const isSelected = selectedRaceId === race.id;
              return (
                <button
                  key={race.id}
                  onClick={() => setSelectedRaceId(race.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all relative ${
                    isSelected
                      ? "bg-zinc-900/80 border-[var(--brand-coral)]/40 shadow-md shadow-orange-500/5"
                      : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      race.difficulty === "Fácil" ? "bg-emerald-500/10 text-emerald-400" :
                      race.difficulty === "Moderado" ? "bg-amber-500/10 text-amber-400" :
                      race.difficulty === "Difícil" ? "bg-rose-500/10 text-rose-400" : "bg-purple-500/10 text-purple-400"
                    }`}>
                      {race.difficulty}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{race.distance}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5 truncate">{race.name}</h4>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">📍 {race.location}</p>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12 text-zinc-600 text-xs font-semibold">
              Ninguna carrera encontrada.
            </div>
          )}
        </div>
      </div>

      {/* Column 2 & 3: Selected Race Details & Leaderboards */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Upper panel: Race Header & Quick Score logging */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-bold text-[var(--brand-coral)] tracking-wider">
                {selectedRace.category === "trail" ? "Carrera Trail ⛰️" : "Carrera Pista 🏃"}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">{selectedRace.distance}</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight mb-2 tracking-tight">
              {selectedRace.name}
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {selectedRace.description}
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-zinc-300">
              <span>📍 {selectedRace.location}</span>
              <span>🌎 {selectedRace.country}</span>
            </div>
          </div>

          {/* Time score logger form */}
          <div className="w-full md:w-56 bg-zinc-950/40 p-4.5 rounded-2xl border border-zinc-900/60 flex flex-col">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Registrar Tiempo</span>
              {successAnimation && <span className="text-emerald-400 animate-bounce">¡Guardado!</span>}
            </h3>
            
            <form onSubmit={handleAddScore} className="flex flex-col gap-3">
              <div className="flex gap-1.5 justify-between">
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Hrs</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    placeholder="0"
                    value={inputHour}
                    onChange={(e) => setInputHour(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-bold text-center text-white py-1.5 rounded-lg outline-none focus:border-[var(--brand-coral)] transition-all"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Mins</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    required
                    placeholder="MM"
                    value={inputMin}
                    onChange={(e) => setInputMin(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-bold text-center text-white py-1.5 rounded-lg outline-none focus:border-[var(--brand-coral)] transition-all"
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="text-[9px] text-zinc-500 font-bold uppercase mb-1">Segs</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="SS"
                    value={inputSec}
                    onChange={(e) => setInputSec(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-xs font-bold text-center text-white py-1.5 rounded-lg outline-none focus:border-[var(--brand-coral)] transition-all"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-[10px] text-rose-500 font-semibold">{formError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[var(--brand-coral)] hover:bg-[var(--brand-coral-hover)] text-white text-xs font-bold py-2 rounded-xl transition-all shadow-md shadow-orange-500/10 cursor-pointer"
              >
                Actualizar Score
              </button>
            </form>
          </div>
        </div>

        {/* Lower panel: Interactive Leaderboards list */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col h-[328px]">
          {/* Level Tabs selector */}
          <div className="flex justify-between items-center mb-4.5 border-b border-zinc-900 pb-3">
            <div className="flex gap-1.5 md:gap-3">
              {[
                { id: "local", label: `📍 Local (5km)` },
                { id: "ciudad", label: "🌆 Ciudad" },
                { id: "pais", label: "🇨🇴 País" },
                { id: "global", label: "🌎 Global" }
              ].map(level => (
                <button
                  key={level.id}
                  onClick={() => setActiveLevel(level.id as any)}
                  className={`text-xs font-bold pb-1 transition-all border-b-2 relative ${
                    activeLevel === level.id
                      ? "border-[var(--brand-coral)] text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>

            {/* Quick user status feedback */}
            {userRankPosition && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                Tu puesto: #{userRankPosition}
              </span>
            )}
          </div>

          {/* Ranking list container */}
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {rankingList.length > 0 ? (
              rankingList.map((runner, index) => {
                const isUser = runner.isCurrentUser;
                const pos = index + 1;

                return (
                  <div
                    key={runner.id}
                    className={`flex items-center justify-between p-2.5 px-4 rounded-xl border transition-all row-anim ${
                      isUser
                        ? "bg-gradient-to-r from-orange-500/10 to-rose-500/5 border-[var(--brand-coral)]/30 glow-coral"
                        : "bg-zinc-950/20 border-zinc-900/50"
                    }`}
                    style={{ animationDelay: `${pos * 0.05}s` }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Place index badge */}
                      <span className={`w-5 text-xs font-extrabold text-center ${
                        pos === 1 ? "text-amber-400" :
                        pos === 2 ? "text-zinc-300" :
                        pos === 3 ? "text-amber-600" : "text-zinc-600"
                      }`}>
                        #{pos}
                      </span>
                      {/* Avatar */}
                      <span className="text-xl w-7 h-7 bg-zinc-900/80 rounded-lg flex items-center justify-center border border-zinc-800/40">
                        {runner.avatar}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-xs font-bold text-white">{runner.name}</h5>
                          {isUser && (
                            <span className="text-[9px] bg-[var(--brand-coral)]/10 text-[var(--brand-coral)] border border-[var(--brand-coral)]/20 px-1.5 py-0.2 rounded font-extrabold uppercase">
                              Tú
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-zinc-500">
                          {runner.location} • {runner.country}
                        </span>
                      </div>
                    </div>
                    
                    {/* Time Score */}
                    <div className="text-right">
                      <span className="text-xs font-black text-white tracking-tight">
                        {runner.timeFormatted}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-600 text-xs font-medium">
                Sin scores registrados en esta categoría geográfica.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
