"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.10)",
          "--normal-text": "rgba(255, 255, 255, 0.8)",
          "--normal-border": "rgba(255, 255, 255, 0.10)",
          "--border-radius": "0.75rem",
          "--width": "100%",
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
