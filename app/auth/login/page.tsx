import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <LoginForm />
    </div>
  );
}
