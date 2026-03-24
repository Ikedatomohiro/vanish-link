import Link from "next/link";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Shield className="h-5 w-5 text-primary" />
          <span>Vanish Link</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
