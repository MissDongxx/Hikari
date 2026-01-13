import { getPage, getPages } from '@/app/source';
import type { Metadata } from 'next';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { slug, locale } = await params;
  const page = getPage(slug, locale);

  if (page == null) {
    notFound();
  }

  const MDX = (page.data as any).exports?.default;

  return (
    <DocsPage>
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return getPages().map((page) => ({
    slug: page.slugs
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug?: string[] }> }) {
  const { slug, locale } = await params;
  const page = getPage(slug, locale);

  if (page == null) notFound();

  return {
    title: page.data.title,
    description: page.data.description || 'Documentation'
  } satisfies Metadata;
}
