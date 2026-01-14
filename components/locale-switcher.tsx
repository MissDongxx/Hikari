'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setLocaleCookie } from '@/lib/locale';

const DEFAULT_LOCALE = 'en';
const LOCALES = ['en', 'zh', 'ja'] as const;

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Wait for client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const getLocalizedPath = (targetLocale: string) => {
    // Get path segments
    const segments = pathname.split('/').filter(Boolean);

    // Check if first segment is a locale
    const firstSegmentIsLocale = LOCALES.includes(segments[0] as typeof LOCALES[number]);

    // Remove current locale prefix if present
    if (firstSegmentIsLocale) {
      segments.shift();
    }

    // With localePrefix: 'always', all locales need prefix
    return '/' + targetLocale + (segments.length ? '/' + segments.join('/') : '');
  };

  const handleLocaleChange = (newLocale: string) => {
    // Set cookie when user explicitly selects a locale
    setLocaleCookie(newLocale as typeof LOCALES[number]);

    // Navigate to the new locale
    router.push(getLocalizedPath(newLocale));
  };

  if (!mounted) {
    // Render a placeholder during SSR to avoid hydration mismatch
    return (
      <div className="flex gap-2">
        {LOCALES.map((l) => (
          <span
            key={l}
            className="px-3 py-1 text-sm rounded-md transition-colors opacity-50"
          >
            {l.toUpperCase()}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => handleLocaleChange(l)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${locale === l
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
            }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

