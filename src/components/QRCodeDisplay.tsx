"use client";

import { QRCode } from "react-qrcode-logo";
import { useEffect, useState } from "react";
import { EVENT_CONFIG } from "@/lib/config";

const { qrSize, qrQuietZone } = EVENT_CONFIG.projection;

export default function QRCodeDisplay() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(`${window.location.origin}/interact`);
  }, []);

  if (!url) return null;

  return (
    <div style={{ lineHeight: 0 }}>
      <QRCode
        value={url}
        size={qrSize}
        bgColor="transparent"
        fgColor="#ffffff"
        qrStyle="squares"
        quietZone={qrQuietZone}
        ecLevel="M"
      />
    </div>
  );
}
