"use client";

import { QRCodeSVG } from "qrcode.react";

/** Check-in QR code — its payload is the reservation UUID, scanned at the venue. */
export function QrCode({
  value,
  size = 168,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={0}
        bgColor="transparent"
        fgColor="#2a2622"
      />
    </div>
  );
}
