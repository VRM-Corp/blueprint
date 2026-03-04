"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { MessageSquare, Pencil, User, Newspaper, Users } from "lucide-react";
import Link from "next/link";
import DrawingCanvas from "@/components/DrawingCanvas";
import LogoStrip from "@/components/LogoStrip";
import SubmitButton from "@/components/SubmitButton";
import IdentityForm from "@/components/IdentityForm";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSubmit } from "@/hooks/useSubmit";
import { getIdentity, type UserIdentity } from "@/lib/identity";
import { uploadDrawingImage } from "@/lib/supabase";
import { EVENT_CONFIG } from "@/lib/config";

function getStickyFontSize(length: number) {
  if (length > 80) return "1rem";
  if (length > 40) return "1.2rem";
  if (length > 20) return "1.4rem";
  return "1.6rem";
}

export default function InteractPage() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const { isSubmitting, submit } = useSubmit();

  useEffect(() => {
    setIdentity(getIdentity());
    setLoaded(true);
  }, []);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || !identity) return;
    await submit("messages", { text: message.trim(), sender_name: identity.name }, {
      successMessage: "Your message is live!",
      onSuccess: () => setMessage(""),
    });
  }, [message, identity, submit]);

  const sendDrawing = useCallback(
    async (dataUrl: string) => {
      if (!identity) return;
      let imageUrl: string;
      try {
        imageUrl = await uploadDrawingImage(dataUrl);
      } catch {
        await submit("drawings", { image_data: dataUrl, sender_name: identity.name }, {
          successMessage: "Your drawing is live!",
        });
        return;
      }
      await submit("drawings", { image_data: imageUrl, sender_name: identity.name }, {
        successMessage: "Your drawing is live!",
      });
    },
    [identity, submit]
  );

  if (!loaded) return null;

  if (!identity) {
    return <IdentityForm onComplete={setIdentity} />;
  }

  if (editing) {
    return (
      <IdentityForm
        existing={identity}
        onComplete={(updated) => {
          setIdentity(updated);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="interact-page h-[100dvh] flex flex-col items-center px-4">
      <Toaster position="bottom-center" />

      <div className="fixed top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
        <Link href="/feed" className="nav-icon pointer-events-auto">
          <Newspaper className="size-[18px]" />
        </Link>
        <Link href="/members" className="nav-icon pointer-events-auto">
          <Users className="size-[18px]" />
        </Link>
      </div>

      <h1
        className="text-4xl sm:text-5xl tracking-tight text-white pt-10 sm:pt-20 pb-1 text-center flex-shrink-0"
        style={{ fontFamily: "Kabond, serif" }}
      >
        {EVENT_CONFIG.title}
      </h1>
      <button
        onClick={() => setEditing(true)}
        className="text-white/30 text-sm pb-4 sm:pb-6 flex items-center gap-2 hover:text-white/50 transition-colors cursor-pointer"
      >
        {identity.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={identity.avatarUrl} alt="" className="size-5 rounded-full object-cover" />
        ) : (
          <User className="size-3.5" />
        )}
        {identity.name}
        <Pencil className="size-3" />
      </button>

      <div className="interact-card w-full max-w-[430px] flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="interact-card-body rounded-2xl flex-1 min-h-0 flex flex-col overflow-hidden">
          <Tabs defaultValue="message" className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <TabsList className="interact-tabs-list w-full">
              <TabsTrigger value="message" className="interact-tab">
                <MessageSquare className="size-4" />
                Message
              </TabsTrigger>
              <TabsTrigger value="draw" className="interact-tab">
                <Pencil className="size-4" />
                Draw
              </TabsTrigger>
            </TabsList>

            <div className="grid flex-1 min-h-0 overflow-hidden">
              <TabsContent
                value="message"
                forceMount
                className="mt-0 [grid-area:1/1] data-[state=inactive]:invisible min-h-0 overflow-hidden"
              >
                <div className="flex flex-col items-center h-full overflow-hidden">
                  <p className="text-white/50 text-sm flex-shrink-0 self-start">
                    Write a sticky note for the board.
                  </p>

                  <div className="flex-1 min-h-0 flex items-center justify-center w-full py-3 overflow-hidden">
                    <div className="relative h-full aspect-square max-w-full bubble-sticky">
                      <Textarea
                        value={message}
                        onChange={(e) =>
                          setMessage(
                            e.target.value.slice(0, EVENT_CONFIG.messageMaxLength)
                          )
                        }
                        placeholder="Write here..."
                        maxLength={EVENT_CONFIG.messageMaxLength}
                        className="sticky-note-input w-full h-full"
                        style={{ fontSize: getStickyFontSize(message.length) }}
                      />
                      <span className="absolute bottom-2 right-2 text-neutral-400 text-[10px] tabular-nums pointer-events-none">
                        {message.length}/{EVENT_CONFIG.messageMaxLength}
                      </span>
                    </div>
                  </div>

                  <SubmitButton
                    onClick={sendMessage}
                    disabled={!message.trim()}
                    isSubmitting={isSubmitting}
                    className="w-full flex-shrink-0"
                  />
                </div>
              </TabsContent>

              <TabsContent
                value="draw"
                forceMount
                className="mt-0 [grid-area:1/1] data-[state=inactive]:invisible min-h-0 overflow-hidden"
              >
                <div className="flex flex-col gap-3 h-full overflow-hidden">
                  <p className="text-white/50 text-sm flex-shrink-0">
                    Draw something and it will appear on screen.
                  </p>
                  <DrawingCanvas
                    onSubmit={sendDrawing}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="flex items-center gap-5 py-4 sm:py-6 flex-shrink-0">
        <LogoStrip logoClassName="h-8 sm:h-10" />
      </div>
    </div>
  );
}
