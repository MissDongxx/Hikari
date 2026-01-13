import { useLocale } from 'next-intl';
import Link from 'next-intl/link';
import { usePathname } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  const locales = ['en', 'zh', 'ja'] as const;

  return (
    <div className="flex gap-2">
      {locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            locale === l
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }`}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
