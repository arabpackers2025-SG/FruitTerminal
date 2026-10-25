"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const NAMES: Record<string, string> = {
  en: "English", ar: "العربية", es: "Español", fr: "Français",
  de: "Deutsch", ru: "Русский", zh: "中文", ja: "日本語",
};

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Language"
      defaultValue={locale}
      disabled={pending}
      onChange={(e) => {
        document.cookie = `ft_lang=${e.target.value};path=/;max-age=31536000;samesite=lax`;
        start(() => router.refresh());
      }}
      className="rounded-sm border border-line bg-paper px-2 py-1 text-sm text-ink-2"
    >
      {Object.entries(NAMES).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
    </select>
  );
}
