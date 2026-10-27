"use client";

import Link from "next/link";
import { Settings, Sparkles } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center">
            <Sparkles className="w-4.5 h-4.5 text-graphite" />
          </div>
          <span className="font-display font-semibold text-graphite text-base tracking-tight">
            DeadlineBuddy
          </span>
        </Link>

        <Link
          href="/settings"
          className="p-2 rounded-xl text-muted hover:text-graphite hover:bg-black/5 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
