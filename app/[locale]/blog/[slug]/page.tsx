import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogSource } from '@/lib/content-source';
import { createMetadata } from '@/utils/metadata';
import { buttonVariants } from '@/components/ui/button';
import { Control } from './page.client';
import { getPostData } from '@/lib/mdx-parser';
import { HeroGradient } from '@/components/hero-gradient';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Param {
  locale: string;
  slug: string;
}

export const dynamicParams = false;

export default async function Page({
  params
}: {
  params: Promise<Param>;
}): Promise<React.ReactElement> {
  const { locale, slug } = await params;
  const blog = getBlogSource(locale);
  const page = blog.getPage([slug]);

  if (!page) notFound();

  // Get post metadata and content
  const { data: metadata, content: mdxContent } = getPostData(slug, locale, 'blog');

  // Merge metadata with page data
  const pageData: Record<string, any> = {
    ...page.data,
    ...metadata
  };

  return (
    <>
      <HeroGradient>
        <h1 className="mb-2 text-3xl font-bold text-white">
          {pageData.title || 'Untitled'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-4">
          {pageData.author && (
            <span>By {pageData.author}</span>
          )}
          {pageData.date && (
            <span>• {formatDate(pageData.date)}</span>
          )}
        </div>
        <Link
          href={`/${locale}/blog`}
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          Back
        </Link>
      </HeroGradient>
      <article className="container px-4 py-8">
        <div className="prose max-w-none dark:prose-invert">
          {/* Render MDX content with react-markdown */}
          <ReactMarkdown>{mdxContent}</ReactMarkdown>
        </div>
      </article>
    </>
  );
}

export async function generateMetadata({ params }: { params: Promise<Param> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const blog = getBlogSource(locale);
  const page = blog.getPage([slug]);

  if (!page) notFound();

  // Get post metadata
  const { data: metadata } = getPostData(slug, locale, 'blog');

  return createMetadata({
    title: metadata.title || page.data.title || 'Blog Post',
    description: metadata.description || (page.data as { description?: string }).description || 'Blog post'
  });
}

export async function generateStaticParams({ params }: { params: { locale: string } }): Promise<Omit<Param, 'locale'>[]> {
  const blog = getBlogSource(params.locale);
  return blog.getPages().map((page: any) => ({
    slug: page.slugs[0]
  }));
}
