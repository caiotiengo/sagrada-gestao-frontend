'use client'

import { QRCodeSVG } from 'qrcode.react'

interface PixQrCodeProps {
  emv: string
  size?: number
}

export function PixQrCode({ emv, size = 200 }: PixQrCodeProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-xl border bg-white p-3">
        <QRCodeSVG value={emv} size={size} level="M" />
      </div>
      <p className="text-xs text-muted-foreground">Escaneie com o app do seu banco</p>
    </div>
  )
}
