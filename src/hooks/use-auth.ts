// src/hooks/use-auth.ts
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "super_admin";
  is_active: boolean;
  password?: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useCurrentAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) fetchAdminRecord(data.session.user);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAdminRecord(session.user);
      else { setAdmin(null); setLoading(false); }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchAdminRecord = async (authUser: User) => {
    try {
      const { data } = await db
        .from("admin_users")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setAdmin(data ?? null);
      if (data) {
        await db
          .from("admin_users")
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", authUser.id);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    admin,
    loading,
    isSuperAdmin: admin?.role === "super_admin",
    isAdmin: !!admin && admin.is_active,
  };
}

export function useAllAdmins() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await db
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      setAdmins(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  return { admins, loading, refetch: fetchAdmins };
}

// ── Create admin ───────────────────────────────────────────────────────────────
// Uses Supabase Auth signUp. To stop confirmation emails:
// Go to Supabase → Authentication → Email → disable "Enable email confirmations"
export async function createAdminUser(
  email: string,
  password: string,
  full_name: string
): Promise<{ error: string | null }> {
  if (password.length < 4) return { error: "Password must be at least 4 characters" };

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    if (authError) return { error: authError.message };
    if (!authData.user) return { error: "User creation failed" };

    const { error: dbError } = await db.from("admin_users").insert({
      id: authData.user.id,
      email,
      full_name,
      role: "admin",
      is_active: true,
    });

    if (dbError) return { error: dbError.message };
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function updateAdminUser(
  id: string,
  updates: Partial<Pick<AdminUser, "full_name" | "is_active" | "role" | "password">>
): Promise<{ error: string | null }> {
  try {
    const { error } = await db.from("admin_users").update(updates).eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function deleteAdminUser(id: string): Promise<{ error: string | null }> {
  try {
    const { error } = await db.from("admin_users").delete().eq("id", id);
    if (error) return { error: error.message };
    return { error: null };
  } catch (e: any) {
    return { error: e.message };
  }
}