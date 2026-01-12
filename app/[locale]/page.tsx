import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">{t('welcome')}</h1>
      <p className="mt-4 text-muted-foreground">
        This is an example of using next-intl for internationalization.
      </p>
    </div>
  );
}
