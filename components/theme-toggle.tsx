"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleThemeChange = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center space-x-2">
      <Sun className="size-5" />
      <Switch
        id="theme-toggle"
        checked={theme === "dark"}
        onCheckedChange={handleThemeChange}
      />
      <Moon className="size-5" />
      <Label htmlFor="theme-toggle" className="sr-only">
        Activer le mode sombre
      </Label>
    </div>
  );
}
