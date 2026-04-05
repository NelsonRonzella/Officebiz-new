import { LoginForm } from "@/components/auth/login-form"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export const metadata = {
  title: "Login — OfficeBiz",
  description: "Acesse sua conta OfficeBiz",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
      <InstallPrompt />
      <LoginForm />
    </div>
  )
}
