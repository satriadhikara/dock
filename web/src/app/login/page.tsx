import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative bg-[#1E609E] flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute inset-0 bg-[url('/loginBackground.png')] bg-cover bg-center bg-no-repeat opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-xl flex-col gap-6">
        <LoginForm />
      </div>
    </div>
  );
}
