import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if credentials are valid and configured (not the default placeholders)
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseUrl !== "https://tu-proyecto-id.supabase.co" &&
  supabaseAnonKey &&
  supabaseAnonKey !== "tu-anon-key-publica-de-supabase"
);

// Initialize Supabase Client if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Log active connection mode to console for development transparency
if (typeof window !== "undefined") {
  if (isSupabaseConfigured) {
    console.log("⚡ [Plataforma Running] Conectado exitosamente a Supabase Database.");
  } else {
    console.log(
      "📦 [Plataforma Running] Supabase no configurado. Utilizando motor Híbrido Local (localStorage Fallback)."
    );
  }
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar: string;
  level: "Amateur" | "Profesional";
  neighborhood: string;
  city: string;
  country: string;
}

// ==========================================
// HELPER: Fetch perfil desde public.users
// ==========================================
async function fetchPublicProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, name, avatar, level, neighborhood, city, country")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

// ==========================================
// AUTHENTICATION INTERFACE (Supabase & Local)
// ==========================================

// 1. Sign Up / Registro
export async function signUpUser(
  email: string,
  password: string,
  name: string,
  avatar: string,
  level: "Amateur" | "Profesional",
  neighborhood: string,
  city: string,
  country: string
): Promise<{ success: boolean; profile: UserProfile | null; error: string | null }> {
  
  if (isSupabaseConfigured && supabase) {
    try {
      // Paso 1: Crear usuario en auth.users con metadatos
      // El trigger handle_new_user() creará automáticamente el registro en public.users
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, avatar, level, neighborhood, city, country },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Paso 2: Esperar un momento para que el trigger se ejecute y luego leer public.users
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let profile = await fetchPublicProfile(data.user.id);
        
        // Si el trigger aún no creó el registro, lo creamos manualmente
        if (!profile) {
          const { error: insertError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              name,
              avatar,
              level,
              neighborhood,
              city,
              country,
            });
          
          if (!insertError) {
            profile = await fetchPublicProfile(data.user.id);
          }
        }

        // Construir perfil desde los datos disponibles
        const finalProfile: UserProfile = profile || {
          id: data.user.id,
          email: data.user.email || email,
          name,
          avatar,
          level,
          neighborhood,
          city,
          country,
        };

        return { success: true, profile: finalProfile, error: null };
      }
      return { success: false, profile: null, error: "Registro incompleto. Intenta de nuevo." };
    } catch (err: any) {
      return { success: false, profile: null, error: err.message || "Error al registrarse en Supabase" };
    }
  } else {
    // Fallback: LocalStorage Authentication
    try {
      const mockUsersJson = localStorage.getItem("running_mock_users") || "[]";
      const mockUsers: UserProfile[] = JSON.parse(mockUsersJson);

      if (mockUsers.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, profile: null, error: "El correo ya está registrado en este navegador." };
      }

      const newUserId = `u_${Date.now()}`;
      const newProfile: UserProfile = { id: newUserId, email, name, avatar, level, neighborhood, city, country };

      mockUsers.push(newProfile);
      localStorage.setItem("running_mock_users", JSON.stringify(mockUsers));

      const credentialStoreJson = localStorage.getItem("running_credential_shadow") || "{}";
      const credentialStore = JSON.parse(credentialStoreJson);
      credentialStore[email.toLowerCase()] = { password, profileId: newUserId };
      localStorage.setItem("running_credential_shadow", JSON.stringify(credentialStore));
      localStorage.setItem("running_active_session", JSON.stringify(newProfile));

      return { success: true, profile: newProfile, error: null };
    } catch {
      return { success: false, profile: null, error: "Fallo de persistencia local." };
    }
  }
}

// 2. Sign In / Inicio de Sesión
export async function signInUser(
  email: string,
  password: string
): Promise<{ success: boolean; profile: UserProfile | null; error: string | null }> {
  
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        // Leer perfil completo desde public.users (fuente de verdad)
        let profile = await fetchPublicProfile(data.user.id);

        // Si no existe en public.users (usuario creado antes del trigger), lo creamos ahora
        if (!profile) {
          const meta = data.user.user_metadata || {};
          const { error: upsertError } = await supabase
            .from("users")
            .upsert({
              id: data.user.id,
              email: data.user.email || email,
              name: meta.name || "Corredor",
              avatar: meta.avatar || "🏃‍♂️",
              level: meta.level || "Amateur",
              neighborhood: meta.neighborhood || "Delicias",
              city: meta.city || "Bogotá",
              country: meta.country || "Colombia",
            });

          if (!upsertError) {
            profile = await fetchPublicProfile(data.user.id);
          }

          // Último fallback: usar metadatos del token
          if (!profile) {
            profile = {
              id: data.user.id,
              email: data.user.email || email,
              name: meta.name || "Corredor",
              avatar: meta.avatar || "🏃‍♂️",
              level: meta.level || "Amateur",
              neighborhood: meta.neighborhood || "Delicias",
              city: meta.city || "Bogotá",
              country: meta.country || "Colombia",
            };
          }
        }

        return { success: true, profile, error: null };
      }
      return { success: false, profile: null, error: "No se pudo obtener el usuario." };
    } catch (err: any) {
      return { success: false, profile: null, error: err.message || "Credenciales incorrectas" };
    }
  } else {
    // Fallback: LocalStorage Auth Verification
    try {
      const shadowJson = localStorage.getItem("running_credential_shadow") || "{}";
      const shadowStore = JSON.parse(shadowJson);
      const record = shadowStore[email.toLowerCase()];

      if (!record || record.password !== password) {
        return { success: false, profile: null, error: "Correo o contraseña incorrectos en este equipo." };
      }

      const mockUsersJson = localStorage.getItem("running_mock_users") || "[]";
      const mockUsers: UserProfile[] = JSON.parse(mockUsersJson);
      const profile = mockUsers.find(u => u.id === record.profileId) || null;

      if (!profile) {
        return { success: false, profile: null, error: "Perfil de corredor dañado o borrado." };
      }

      localStorage.setItem("running_active_session", JSON.stringify(profile));
      return { success: true, profile, error: null };
    } catch {
      return { success: false, profile: null, error: "Error en el almacenamiento de credenciales locales." };
    }
  }
}

// 3. Sign Out / Cierre de Sesión
export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem("running_active_session");
  }
}

// 4. Get Current Active Session
export async function getCurrentSession(): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session?.user) return null;

      const authUser = data.session.user;

      // Leer perfil completo desde public.users
      let profile = await fetchPublicProfile(authUser.id);

      // Si no existe, sincronizar desde metadatos
      if (!profile) {
        const meta = authUser.user_metadata || {};
        await supabase.from("users").upsert({
          id: authUser.id,
          email: authUser.email || "",
          name: meta.name || "Corredor",
          avatar: meta.avatar || "🏃‍♂️",
          level: meta.level || "Amateur",
          neighborhood: meta.neighborhood || "Delicias",
          city: meta.city || "Bogotá",
          country: meta.country || "Colombia",
        });
        profile = await fetchPublicProfile(authUser.id);
      }

      return profile;
    } catch {
      return null;
    }
  } else {
    try {
      const sessionJson = localStorage.getItem("running_active_session");
      return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (err) {
      return null;
    }
  }
}
