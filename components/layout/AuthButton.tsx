// components/layout/AuthButton.tsx
"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { GithubIcon } from "@/components/shared/SocialIcons";

export default function AuthButton() {
  const { user, loading, signInWithGithub, signOut } = useAuth();

  if (loading) {
    return (
      <div
        className="w-9 h-9 rounded-full bg-surface-elevated border border-border-subt animate-pulse"
        aria-hidden="true"
      />
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGithub}
        className="flex items-center gap-1.5 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary border border-border-subt hover:border-border-def hover:bg-surface-elevated px-3.5 h-9 rounded-md transition-all cursor-pointer"
      >
        <GithubIcon className="w-3.5 h-3.5" />
        Sign in with GitHub
      </button>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const username =
    user.user_metadata?.user_name || user.user_metadata?.preferred_username || "reviewer";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border-subt hover:border-border-def transition-colors cursor-pointer p-0.5 pr-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={username}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <span className="w-7 h-7 rounded-full bg-surface-elevated flex items-center justify-center text-[11px] font-mono font-bold text-txt-primary">
              {username.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span className="text-xs font-sans font-medium text-txt-secondary">{username}</span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[160px] bg-surface-card border border-border-subt rounded-md py-1.5 z-50 [box-shadow:var(--shadow-elevated)]"
        >
          <DropdownMenu.Item
            onSelect={signOut}
            className="flex items-center gap-2 px-3 py-2 text-xs font-sans font-medium text-txt-secondary hover:text-txt-primary hover:bg-surface-elevated cursor-pointer outline-none transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
