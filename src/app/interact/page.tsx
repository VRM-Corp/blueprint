"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Send, Pencil, MessageSquare } from "lucide-react";
import DrawingCanvas from "@/components/DrawingCanvas";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { EVENT_CONFIG } from "@/lib/config";

export default function InteractPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({ text: message.trim() });
      if (error) throw error;
      setMessage("");
      toast.success("Your message is live!");
    } catch {
      toast.error("Failed to send. Try again!");
    } finally {
      setSending(false);
    }
  }, [message, sending]);

  const sendDrawing = useCallback(async (dataUrl: string) => {
    setSending(true);
    try {
      const { error } = await supabase
        .from("drawings")
        .insert({ image_data: dataUrl });
      if (error) throw error;
      toast.success("Your drawing is live!");
    } catch {
      toast.error("Failed to send. Try again!");
    } finally {
      setSending(false);
    }
  }, []);

  return (
    <div className="interact-page min-h-[100dvh] flex items-start justify-center">
      <Toaster position="top-center" />

      <div className="interact-card w-full max-w-[430px] mx-auto">
        <header className="text-center pt-14 pb-8">
          <h1
            className="text-5xl tracking-tight text-white"
            style={{ fontFamily: "Kabond, serif" }}
          >
            {EVENT_CONFIG.title}
          </h1>
          <p className="text-white/30 text-[11px] mt-2 tracking-[0.35em] uppercase font-medium">
            {EVENT_CONFIG.venue}
          </p>
        </header>

        <div className="interact-card-body mx-4 rounded-2xl">
          <Tabs defaultValue="message">
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

            <TabsContent value="message" className="mt-0">
              <div className="space-y-6">
                <p className="text-white/50 text-sm">
                  Your message will float across the projection screen.
                </p>

                <Textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value.slice(0, EVENT_CONFIG.messageMaxLength)
                    )
                  }
                  placeholder="Type your message..."
                  maxLength={EVENT_CONFIG.messageMaxLength}
                  rows={4}
                  className="interact-textarea"
                />

                <div className="flex items-center justify-between">
                  <span className="text-white/25 text-xs tabular-nums">
                    {message.length}/{EVENT_CONFIG.messageMaxLength}
                  </span>
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                    className="interact-btn-primary"
                  >
                    {sending ? "Sending..." : "Send"}
                    {!sending && <Send className="size-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="draw" className="mt-0">
              <div className="space-y-6">
                <p className="text-white/50 text-sm">
                  Draw something and it will appear on screen.
                </p>
                <DrawingCanvas onSubmit={sendDrawing} submitting={sending} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
