import { getDocsSource } from '@/lib/content-source';
import type { Metadata } from 'next';
import { DocsPage, DocsBody } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

export default async function Page({
  params
}: {
  params: { locale: string; slug?: string[] };
}) {
  const docs = getDocsSource(params.locale);
  const page = docs.getPage(params.slug);

  if (page == null) {
    notFound();
  }

  const MDX = page.data.exports.default;

  return (
    <DocsPage toc={page.data.exports.toc} full={page.data.full}>
      <DocsBody>
        <h1>{page.data.title}</h1>
        <MDX />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams({ locale }: { locale: string }) {
  const docs = getDocsSource(locale);
  return docs.getPages().map((page) => ({
    slug: page.slugs
  }));
}

export function generateMetadata({ params }: { params: { locale: string; slug?: string[] } }) {
  const docs = getDocsSource(params.locale);
  const page = docs.getPage(params.slug);

  if (page == null) notFound();

  return {
    title: page.data.title,
    description: page.data.description
  } satisfies Metadata;
}
