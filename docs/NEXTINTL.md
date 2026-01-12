# next-intl Internationalization Setup

This project uses [next-intl](https://next-intl-docs.vercel.app/) for internationalization.

## Supported Languages

- English (`en`) - Default
- Chinese (`zh`)

## Project Structure

```
├── i18n.ts                          # i18n configuration
├── messages/                        # Translation files
│   ├── en.json                      # English translations
│   └── zh.json                      # Chinese translations
├── app/
│   ├── [locale]/                    # Locale-based routing
│   │   ├── layout.tsx               # Locale layout with provider
│   │   └── page.tsx                 # Homepage (example)
│   └── layout.tsx                   # Root layout
└── middleware.ts                    # Locale detection & routing
```

## How It Works

### 1. Automatic Locale Detection

The middleware automatically detects the user's preferred language from:
- URL path (e.g., `/zh/about`)
- `Accept-Language` header
- Cookie (if previously set)

### 2. Locale Routing

All pages are now under the `[locale]` dynamic segment:
- English: `http://localhost:3000/en`
- Chinese: `http://localhost:3000/zh`

### 3. Using Translations

In Server Components:
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

In Client Components:
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations('common');
  return <h1>{t('welcome')}</h1>;
}
```

### 4. Adding New Translations

1. Add keys to both `messages/en.json` and `messages/zh.json`:
```json
{
  "newKey": "English text",
  "nested": {
    "key": "More text"
  }
}
```

2. Use in components:
```tsx
const t = useTranslations('newKey');
const t2 = useTranslations('nested.key');
```

### 5. Language Switcher

Create a language switcher component:

```tsx
'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace current locale in pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPathname);
  };

  return (
    <div>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={locale === loc ? 'font-bold' : ''}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
```

### 6. Adding New Languages

1. Add the locale to `i18n.ts`:
```ts
export const locales = ['en', 'zh', 'ja'] as const; // Added Japanese
```

2. Create a new translation file `messages/ja.json`

3. Use the new locale in URLs: `/ja/about`

## API Routes with i18n

For API routes that need translations:

```tsx
import { getTranslations } from 'next-intl/server';

export async function GET(request: Request) {
  const t = await getTranslations('common');
  return Response.json({ message: t('welcome') });
}
```

## Static Generation

The app uses static generation for better performance. Each locale generates static pages at build time.

## Middleware Configuration

The middleware handles:
- Locale detection and redirection
- Session management (Supabase)
- Path tracking

Paths excluded from locale routing:
- `/api/*`
- `/_next/static/*`
- `/_next/image/*`
- `/favicon.ico`
- Static assets (images, fonts, etc.)

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Organize translations by feature** - Use nested namespaces (e.g., `nav.home`, `auth.login`)
3. **Keep translations in sync** - Ensure all locales have the same keys
4. **Use interpolation** - Pass dynamic values to translations:
```tsx
// messages/en.json
{ "greeting": "Hello, {name}!" }

// Component
t('greeting', { name: 'John' })
```

5. **Date and number formatting**:
```tsx
import { formatDate, formatNumber } from 'next-intl';

formatDate(new Date(), { dateStyle: 'long' });
formatNumber(1234.56, { style: 'currency', currency: 'USD' });
```

## Troubleshooting

### "Locale not found" error
- Check that the locale is defined in `i18n.ts`
- Verify the translation file exists in `messages/`

### Translations not appearing
- Ensure you're using `useTranslations` in client components or `getTranslations` in server components
- Check that the `NextIntlClientProvider` wraps your app

### Build errors
- Make sure all translation files have matching keys
- Verify JSON syntax in translation files
