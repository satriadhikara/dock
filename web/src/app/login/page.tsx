import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-[#1E609E] flex min-h-svh flex-col items-end justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  )
}
