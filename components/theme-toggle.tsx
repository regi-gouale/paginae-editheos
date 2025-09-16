"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleThemeChange = () => {
    // Si le thème actuel est "system", on passe au thème opposé à resolvedTheme
    // Sinon, on bascule entre light et dark
    if (theme === "system") {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    } else {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }
  };

  // Utiliser resolvedTheme pour l'état du switch
  // resolvedTheme retourne toujours "dark" ou "light", même si theme est "system"
  const isChecked = resolvedTheme === "dark";

  return (
    <div className="flex items-center space-x-2">
      <Sun className="size-5" />
      <Switch
        id="theme-toggle"
        checked={isChecked}
        onCheckedChange={handleThemeChange}
      />
      <Moon className="size-5" />
      <Label htmlFor="theme-toggle" className="sr-only">
        Activer le mode sombre
      </Label>
    </div>
  );
}
