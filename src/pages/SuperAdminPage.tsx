import React, { useState } from "react";
import { useAllAdmins, createAdminUser, updateAdminUser, deleteAdminUser } from "../hooks/use-auth";
import type { AdminUser } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Shield, Clock, CheckCircle, XCircle, RefreshCw, Eye, EyeOff } from "lucide-react";

// ─── Create / Edit Form ───────────────────────────────────────────────────────
const AdminForm: React.FC<{
  admin?: AdminUser;
  onSave: () => void;
  onCancel: () => void;
}> = ({ admin, onSave, onCancel }) => {
  const [form, setForm] = useState({
    full_name: admin?.full_name || "",
    email: admin?.email || "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error("Name is required"); return; }
    if (!admin && !form.email.trim()) { toast.error("Email is required"); return; }
    if (!admin && form.password.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    if (admin && form.password.length > 0 && form.password.length < 4) {
      toast.error("Password must be at least 4 characters"); return;
    }

    setSaving(true);
    try {
      if (admin) {
        const updates: Partial<AdminUser> = { full_name: form.full_name };
        if (form.password.length >= 4) updates.password = form.password;
        const { error } = await updateAdminUser(admin.id, updates);
        if (error) { toast.error(error); return; }
        toast.success("Admin updated");
      } else {
        const { error } = await createAdminUser(form.email, form.password, form.full_name);
        if (error) { toast.error(error); return; }
        toast.success("Admin created successfully");
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-bold text-foreground">
          {admin ? "Edit Admin" : "Create New Admin"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Full Name</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            placeholder="e.g. John Doe"
          />
        </div>

        {!admin && (
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. john@gmail.com"
            />
          </div>
        )}

        <div className={admin ? "sm:col-span-2" : ""}>
          <Label>
            {admin ? "New Password (leave blank to keep current)" : "Password (min 4 characters)"}
          </Label>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={admin ? "Leave blank to keep current..." : "min 4 characters"}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {form.password.length > 0 && form.password.length < 4 && (
            <p className="text-destructive text-xs mt-1">Password must be at least 4 characters</p>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : admin ? "Update Admin" : "Create Admin"}
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

// ─── Super Admin Page ─────────────────────────────────────────────────────────
const SuperAdminPage: React.FC = () => {
  const { admins, loading, refetch } = useAllAdmins();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set());

  const toggleReveal = (id: string) => {
    setRevealedPasswords((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleActive = async (admin: AdminUser) => {
    const { error } = await updateAdminUser(admin.id, { is_active: !admin.is_active });
    if (error) { toast.error(error); return; }
    toast.success(admin.is_active ? "Admin deactivated" : "Admin activated");
    refetch();
  };

  const handleDelete = async (admin: AdminUser) => {
    if (admin.role === "super_admin") { toast.error("Cannot delete super admin"); return; }
    if (!confirm(`Delete admin "${admin.full_name}"? This cannot be undone.`)) return;
    const { error } = await deleteAdminUser(admin.id);
    if (error) { toast.error(error); return; }
    toast.success("Admin deleted");
    refetch();
  };

  const formatDate = (str: string | null) => {
    if (!str) return "Never";
    return new Date(str).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const regularAdmins = admins.filter((a) => a.role !== "super_admin");

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-heading font-black text-foreground">Super Admin Panel</h1>
          </div>
          <p className="text-muted-foreground text-sm">Manage admin accounts and access</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refetch} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {!showForm && (
            <Button onClick={() => { setEditing(null); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Admin
            </Button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <AdminForm
            admin={editing || undefined}
            onSave={() => { setShowForm(false); setEditing(null); refetch(); }}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Admins", value: regularAdmins.length, color: "text-foreground" },
          { label: "Active", value: regularAdmins.filter((a) => a.is_active).length, color: "text-green-500" },
          { label: "Inactive", value: regularAdmins.filter((a) => !a.is_active).length, color: "text-destructive" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center">
            <p className={`text-3xl font-heading font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Admins table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-muted-foreground text-left">
              <th className="px-5 py-3 font-semibold">Admin</th>
              <th className="px-5 py-3 font-semibold">Password</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Last Login</span>
              </th>
              <th className="px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Loading...</td>
              </tr>
            ) : regularAdmins.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                  No admins yet. Create one above.
                </td>
              </tr>
            ) : (
              regularAdmins.map((admin, i) => (
                <tr key={admin.id}
                  className={`border-t border-border ${i % 2 === 0 ? "bg-card" : "bg-muted/20"}`}>

                  {/* Name + Email */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">{admin.full_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{admin.email}</p>
                  </td>

                  {/* Password with toggle */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {revealedPasswords.has(admin.id) ? (admin.password || "—") : "••••••"}
                      </span>
                      <button
                        onClick={() => toggleReveal(admin.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {revealedPasswords.has(admin.id)
                          ? <EyeOff className="h-3.5 w-3.5" />
                          : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      admin.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
                    }`}>
                      {admin.is_active
                        ? <><CheckCircle className="h-3 w-3" /> Active</>
                        : <><XCircle className="h-3 w-3" /> Inactive</>}
                    </span>
                  </td>

                  {/* Last Login */}
                  <td className="px-5 py-4 text-muted-foreground text-xs">
                    {formatDate(admin.last_login_at)}
                  </td>

                  {/* Created */}
                  <td className="px-5 py-4 text-muted-foreground text-xs">
                    {formatDate(admin.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" title="Edit"
                        onClick={() => { setEditing(admin); setShowForm(true); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        title={admin.is_active ? "Deactivate" : "Activate"}
                        onClick={() => handleToggleActive(admin)}>
                        {admin.is_active
                          ? <XCircle className="h-4 w-4 text-destructive" />
                          : <CheckCircle className="h-4 w-4 text-green-500" />}
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete"
                        onClick={() => handleDelete(admin)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Super admin info block */}
      <div className="mt-8 bg-muted/30 border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary" />
          <p className="font-semibold text-foreground text-sm">Super Admin Account</p>
        </div>
        <p className="text-muted-foreground text-xs">
          The super admin account (<strong>super@gmail.com</strong>) has permanent, full access.
          It cannot be deleted or deactivated from this panel.
        </p>
      </div>
    </div>
  );
};

export default SuperAdminPage;