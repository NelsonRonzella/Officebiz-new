"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OtpFormProps {
  onSubmit: (code: string) => void
  onResend: () => void
  loading: boolean
  error: string
}

export function OtpForm({ onSubmit, onResend, loading, error }: OtpFormProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [countdown, setCountdown] = useState(30)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    const code = newOtp.join("")
    if (code.length === 6 && newOtp.every((d) => d !== "")) {
      onSubmit(code)
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(""))
      onSubmit(pasted)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 text-center text-xl font-bold"
            disabled={loading}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      <Button
        type="button"
        className="w-full"
        onClick={() => onSubmit(otp.join(""))}
        disabled={loading || otp.some((d) => d === "")}
      >
        {loading ? "Verificando..." : "Verificar"}
      </Button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            Não recebeu? Reenviar em {countdown}s
          </p>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCountdown(30)
              onResend()
            }}
            className="text-sm text-primary hover:underline"
          >
            Reenviar código
          </button>
        )}
      </div>
    </div>
  )
}
