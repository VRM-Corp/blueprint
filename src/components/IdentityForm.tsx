"use client";

import { useState, useCallback, useRef } from "react";
import { ArrowRight, Camera } from "lucide-react";
import LogoStrip from "@/components/LogoStrip";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { saveIdentity, type UserIdentity } from "@/lib/identity";
import { EVENT_CONFIG, CONTACT_TYPES, type ContactTypeId } from "@/lib/config";
import { toast } from "sonner";

type IdentityFormProps = {
  existing?: UserIdentity;
  onComplete: (identity: UserIdentity) => void;
  onCancel?: () => void;
};

export default function IdentityForm({
  existing,
  onComplete,
  onCancel,
}: IdentityFormProps) {
  const isEditing = !!existing;
  const [name, setName] = useState(existing?.name ?? "");
  const [contact, setContact] = useState(existing?.contact ?? "");
  const [contactType, setContactType] = useState<ContactTypeId | undefined>(
    (existing?.contactType as ContactTypeId) ?? undefined
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(existing?.avatarUrl);
  const [joining, setJoining] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedType = CONTACT_TYPES.find((t) => t.id === contactType);
  const contactPlaceholder = selectedType?.placeholder ?? "Select a platform above";

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }, []);

  const uploadAvatar = useCallback(async (participantId: string, file: File): Promise<string | null> => {
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${participantId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatar").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("avatar").getPublicUrl(path);
      return data.publicUrl;
    } catch {
      toast.error("Photo upload failed — saving without it.");
      return null;
    }
  }, []);

  const handleJoin = useCallback(async () => {
    const trimmed = name.trim();
    if (!trimmed || joining) return;
    setJoining(true);
    try {
      if (isEditing) {
        let avatarUrl = existing.avatarUrl;
        if (avatarFile) {
          avatarUrl = (await uploadAvatar(existing.participantId, avatarFile)) ?? avatarUrl;
        }
        const { error } = await supabase
          .from("participants")
          .update({
            name: trimmed,
            contact: contact.trim() || null,
            contact_type: contactType ?? null,
            avatar_url: avatarUrl ?? null,
          })
          .eq("id", existing.participantId);
        if (error) throw error;

        if (existing.name !== trimmed) {
          await Promise.all([
            supabase.from("messages").update({ sender_name: trimmed }).eq("sender_name", existing.name),
            supabase.from("drawings").update({ sender_name: trimmed }).eq("sender_name", existing.name),
          ]);
        }

        const identity: UserIdentity = {
          ...existing,
          name: trimmed,
          contact: contact.trim() || undefined,
          contactType,
          avatarUrl,
        };
        saveIdentity(identity);
        onComplete(identity);
      } else {
        const { data, error } = await supabase
          .from("participants")
          .insert({
            name: trimmed,
            contact: contact.trim() || null,
            contact_type: contactType ?? null,
          })
          .select("id")
          .single();
        if (error) throw error;
        let avatarUrl: string | undefined;
        if (avatarFile) {
          avatarUrl = (await uploadAvatar(data.id, avatarFile)) ?? undefined;
          if (avatarUrl) {
            await supabase.from("participants").update({ avatar_url: avatarUrl }).eq("id", data.id);
          }
        }
        const identity: UserIdentity = {
          name: trimmed,
          contact: contact.trim() || undefined,
          contactType,
          avatarUrl,
          participantId: data.id,
        };
        saveIdentity(identity);
        onComplete(identity);
      }
    } catch {
      toast.error(isEditing ? "Failed to update. Try again!" : "Failed to join. Try again!");
      setJoining(false);
    }
  }, [name, contact, contactType, joining, onComplete, isEditing, existing, avatarFile, uploadAvatar]);

  return (
    <div className="interact-page h-[100dvh] flex flex-col items-center justify-center px-4">
      <Toaster position="bottom-center" />

      <h1
        className="text-4xl sm:text-5xl tracking-tight text-white pb-2 text-center"
        style={{ fontFamily: "Kabond, serif" }}
      >
        {EVENT_CONFIG.title}
      </h1>
      <p className="text-white/40 text-sm mb-8">
        {isEditing ? "Update your info" : "Identify yourself to join"}
      </p>

      <div className="w-full max-w-[380px]">
        <div className="interact-card-body rounded-2xl flex flex-col gap-5 p-6">
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative size-20 rounded-full flex items-center justify-center overflow-hidden transition-opacity hover:opacity-80"
              style={{ background: "var(--glass-10)", border: "2px dashed var(--glass-15)" }}
            >
              {avatarPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="" className="size-full object-cover" />
              ) : (
                <Camera className="size-6 text-white/30" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <span className="text-white/30 text-xs">
              {avatarPreview ? "Tap to change" : "Add a photo"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={40}
              autoFocus
              className="interact-textarea h-12 !min-h-0 !resize-none"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">
              Contact <span className="text-white/30 normal-case font-normal">(optional)</span>
            </label>
            <div className="grid grid-cols-4 gap-0 mb-1 rounded-xl overflow-hidden" style={{ border: "1px solid var(--glass-8)" }}>
              {CONTACT_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setContactType(contactType === t.id ? undefined : t.id)}
                  className="flex items-center justify-center h-11 transition-colors"
                  style={{
                    background: contactType === t.id ? "var(--glass-15)" : "var(--glass-4)",
                  }}
                  title={t.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.icon}
                    alt={t.label}
                    className="size-5"
                    style={{ opacity: contactType === t.id ? 1 : 0.4 }}
                  />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={contactPlaceholder}
              maxLength={80}
              className="interact-textarea h-12 !min-h-0 !resize-none"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>

          <Button
            onClick={handleJoin}
            disabled={!name.trim() || joining}
            className="interact-btn-primary w-full mt-1"
          >
            {joining ? (isEditing ? "Saving..." : "Joining...") : isEditing ? "Save" : "Join"}
            {!joining && <ArrowRight className="size-4" />}
          </Button>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white/30 text-sm hover:text-white/50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-5 py-6 flex-shrink-0">
        <LogoStrip logoClassName="h-8 sm:h-10" />
      </div>
    </div>
  );
}
