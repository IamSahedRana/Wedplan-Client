"use client";

import { LoaderCircle, Lock, Save, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/shared/ImageUploader";
import { ErrorState } from "@/components/shared/ErrorState";
import { PremiumBadge } from "@/components/shared/PremiumBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api, invalidateToken } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const EMPTY = {
  name: "",
  image: "",
  phone: "",
  address: "",
  bio: "",
  businessName: "",
};

function fromUser(user) {
  return {
    name: user?.name || "",
    image: user?.image || "",
    phone: user?.phone || "",
    address: user?.address || "",
    bio: user?.bio || "",
    businessName: user?.businessName || "",
  };
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-muted-foreground">
        <Lock className="size-3" /> {label}
      </Label>
      <div className="flex min-h-10 items-center rounded-xl border border-border bg-muted/50 px-3 text-sm text-secondary-foreground">
        {value || "—"}
      </div>
    </div>
  );
}

/** Shared profile form for vendor, customer and admin dashboards. */
export function ProfileSettings({ role }) {
  const router = useRouter();
  const [state, setState] = useState({ loading: true, error: null, user: null });
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setState({ loading: true, error: null, user: null });
    api
      .get("/me")
      .then((data) => {
        setState({ loading: false, error: null, user: data.user });
        setForm(fromUser(data.user));
      })
      .catch((err) =>
        setState({ loading: false, error: err.message || "Failed to load your profile", user: null })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function save(e) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        image: form.image || "",
        phone: form.phone.trim(),
        address: form.address.trim(),
        bio: form.bio.trim(),
      };
      if (role === "vendor") payload.businessName = form.businessName.trim();

      const data = await api.patch("/profile", payload);
      setState((s) => ({ ...s, user: data.user }));
      invalidateToken();
      toast.success("Profile updated successfully");
    } catch (err) {
      toast.error(err.message || "Could not save your profile");
      return;
    } finally {
      setSaving(false);
    }

    // Session refresh is best-effort: a save already succeeded, so its failure
    // must not show a false "could not save" error.
    try {
      await authClient.getSession();
      router.refresh();
    } catch {
      // Keep the saved state; the next session read will pick up the change.
    }
  }

  if (state.loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-56 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-[32rem] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (state.error) {
    return <ErrorState title="Couldn't load your profile" message={state.error} onRetry={load} />;
  }

  const { user } = state;
  const plan = user?.subscriptionPlan;
  const isPremium =
    (plan === "PRO" && user?.subscriptionTimeline === "UNLIMITED") ||
    (plan === "premium" &&
      !!user?.subscriptionExpiresAt &&
      new Date(user.subscriptionExpiresAt).getTime() > Date.now());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal details and how customers see you.
        </p>
      </div>

      <form onSubmit={save} className="grid items-start gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card className="space-y-4 p-5">
            <div className="flex items-center gap-2">
              <UserCog className="size-5 text-primary" />
              <h2 className="font-semibold text-foreground">Profile photo</h2>
            </div>
            <ImageUploader
              value={form.image ? [form.image] : []}
              onChange={(urls) => set("image", urls[0] || "")}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP or GIF up to 5MB. Shown beside your name across WedPlan.
            </p>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-semibold text-foreground">Account details</h2>
            <p className="text-xs text-muted-foreground">These details can&apos;t be changed here.</p>
            <ReadOnlyField label="Email" value={user.email} />
            <ReadOnlyField label="Role" value={user.role ? String(user.role).replace(/^./, (c) => c.toUpperCase()) : "—"} />
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-muted-foreground">
                <Lock className="size-3" /> Plan
              </Label>
              <div className="flex min-h-10 items-center gap-2 rounded-xl border border-border bg-muted/50 px-3">
                {role === "vendor" ? (
                  isPremium ? (
                    <PremiumBadge />
                  ) : (
                    <span className="text-sm text-secondary-foreground">Free</span>
                  )
                ) : (
                  <span className="text-sm text-secondary-foreground">Not applicable</span>
                )}
              </div>
            </div>
          </Card>
        </div>

        <Card className="space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="font-semibold text-foreground">Editable information</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Changes are saved to your account immediately.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name">Full name</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                maxLength={100}
                required
              />
            </div>
            {role === "vendor" && (
              <div className="space-y-1.5">
                <Label htmlFor="profile-business">Business name</Label>
                <Input
                  id="profile-business"
                  value={form.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                  placeholder="Your studio or company"
                  maxLength={100}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="Contact number"
                maxLength={30}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-address">Address</Label>
              <Input
                id="profile-address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="City, area"
                maxLength={200}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder={role === "vendor" ? "Tell couples about your work…" : "A little about yourself…"}
              maxLength={1000}
              rows={5}
            />
            <p className="text-right text-xs text-muted-foreground">{form.bio.length}/1000</p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => setForm(fromUser(user))}
              disabled={saving}
            >
              Discard changes
            </Button>
            <Button type="submit" className="rounded-full" disabled={saving}>
              {saving ? (
                <><LoaderCircle className="size-4 animate-spin" /> Saving…</>
              ) : (
                <><Save className="size-4" /> Save Changes</>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
