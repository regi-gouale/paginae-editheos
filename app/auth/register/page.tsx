import { RegisterForm } from "@/components/auth/register-form";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <RegisterForm />
    </div>
  );
}
