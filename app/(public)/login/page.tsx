import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login — OfficeBiz",
  description: "Acesse sua conta OfficeBiz",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <LoginForm />
    </div>
  )
}
