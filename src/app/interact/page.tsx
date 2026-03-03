"use client";

import { useState, useCallback } from "react";
import { MessageSquare, Pencil } from "lucide-react";
import DrawingCanvas from "@/components/DrawingCanvas";
import LogoStrip from "@/components/LogoStrip";
import SubmitButton from "@/components/SubmitButton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSubmit } from "@/hooks/useSubmit";
import { EVENT_CONFIG } from "@/lib/config";

export default function InteractPage() {
  const [message, setMessage] = useState("");
  const { isSubmitting, submit } = useSubmit();

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;
    await submit("messages", { text: message.trim() }, {
      successMessage: "Your message is live!",
      onSuccess: () => setMessage(""),
    });
  }, [message, submit]);

  const sendDrawing = useCallback(
    async (dataUrl: string) => {
      await submit("drawings", { image_data: dataUrl }, {
        successMessage: "Your drawing is live!",
      });
    },
    [submit]
  );

  return (
    <div className="interact-page h-[100dvh] flex flex-col items-center px-4">
      <Toaster position="bottom-center" />

      <h1
        className="text-4xl sm:text-5xl tracking-tight text-white pt-10 sm:pt-20 pb-4 sm:pb-6 text-center flex-shrink-0"
        style={{ fontFamily: "Kabond, serif" }}
      >
        {EVENT_CONFIG.title}
      </h1>

      <div className="interact-card w-full max-w-[430px] flex-1 min-h-0 flex flex-col">
        <div className="interact-card-body rounded-2xl flex-1 min-h-0 flex flex-col">
          <Tabs defaultValue="message" className="flex-1 min-h-0">
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

            <div className="grid flex-1 min-h-0">
              <TabsContent
                value="message"
                forceMount
                className="mt-0 [grid-area:1/1] data-[state=inactive]:invisible min-h-0"
              >
                <div className="flex flex-col gap-4 sm:gap-6 h-full">
                  <p className="text-white/50 text-sm flex-shrink-0">
                    Your message will float across the projection screen.
                  </p>

                  <div className="relative flex-1 min-h-0">
                    <Textarea
                      value={message}
                      onChange={(e) =>
                        setMessage(
                          e.target.value.slice(0, EVENT_CONFIG.messageMaxLength)
                        )
                      }
                      placeholder="Type your message..."
                      maxLength={EVENT_CONFIG.messageMaxLength}
                      className="interact-textarea h-full"
                    />
                    <span className="absolute bottom-3 right-3 text-white/25 text-xs tabular-nums pointer-events-none">
                      {message.length}/{EVENT_CONFIG.messageMaxLength}
                    </span>
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
                className="mt-0 [grid-area:1/1] data-[state=inactive]:invisible min-h-0"
              >
                <div className="flex flex-col gap-4 sm:gap-6 h-full">
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
