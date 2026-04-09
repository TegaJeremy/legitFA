import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children, requireSuperAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const checkUser = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setAuthenticated(false);
        return;
      }

      const { data: adminRecord } = await db
        .from("admin_users")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (adminRecord && adminRecord.is_active) {
        setAuthenticated(true);
        setIsSuperAdmin(adminRecord.role === "super_admin");
      } else {
        setAuthenticated(false);
        setIsSuperAdmin(false);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/admin/login" replace />;
  if (requireSuperAdmin && !isSuperAdmin) return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

export default AdminGuard;