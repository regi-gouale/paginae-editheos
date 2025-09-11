import { RegisterForm } from "@/components/auth/register-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 gap-16 sm:p-20 bg-background">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
