import { supabase } from "./supabaseClient";

export type AppRole = "admin" | "cliente";

export type AppUser = {
  id: string;
  nome: string;
  role: AppRole;
  email?: string;
};

async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, role, whatsapp")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string): Promise<AppUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = data.user;
  if (!user) throw new Error("Login falhou: usuário não encontrado.");

  const profile = await getProfile(user.id);

  const role: AppRole = profile.role === "admin" ? "admin" : "cliente";

  return {
    id: user.id,
    nome: profile.full_name || email.split("@")[0],
    role,
    email: user.email ?? email,
  };
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUserFromSession(): Promise<AppUser | null> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session?.user) return null;

  const user = session.user;
  const profile = await getProfile(user.id);

  const role: AppRole = profile.role === "admin" ? "admin" : "cliente";

  return {
    id: user.id,
    nome: profile.full_name || (user.email ? user.email.split("@")[0] : "Cliente"),
    role,
    email: user.email ?? undefined,
  };
}
