import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogSource } from '@/lib/content-source';
import { createMetadata } from '@/utils/metadata';
import { buttonVariants } from '@/components/ui/button';
import { Control } from './page.client';
import { getPostData } from '@/lib/mdx-parser';

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
      <div
        className="container rounded-xl border py-12 md:px-8"
        style={{
          backgroundColor: 'black',
          backgroundImage: [
            'linear-gradient(140deg, hsla(274,94%,54%,0.3), transparent 50%)',
            'linear-gradient(to left top, hsla(260,90%,50%,0.8), transparent 50%)',
            'radial-gradient(circle at 100% 100%, hsla(240,100%,82%,1), hsla(240,40%,40%,1) 17%, hsla(240,40%,40%,0.5) 20%, transparent)'
          ].join(', '),
          backgroundBlendMode: 'difference, difference, normal'
        }}
      >
        <h1 className="mb-2 text-3xl font-bold text-white">
          {pageData.title || 'Untitled'}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-white/80 mb-4">
          {pageData.author && (
            <span>By {pageData.author}</span>
          )}
          {pageData.date && (
            <span>• {new Date(pageData.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })}</span>
          )}
        </div>
        <Link
          href={`/${locale}/blog`}
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          Back
        </Link>
      </div>
      <article className="container px-4 py-8">
        <div className="prose max-w-none dark:prose-invert">
          {/* Render MDX content */}
          <div dangerouslySetInnerHTML={{ __html: mdxContent
            // Convert markdown to HTML (basic conversion)
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br />')
          }} />
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
    description: metadata.description || (page.data as any).description || 'Blog post'
  });
}

export async function generateStaticParams({ params }: { params: { locale: string } }): Promise<Omit<Param, 'locale'>[]> {
  const blog = getBlogSource(params.locale);
  return blog.getPages().map((page: any) => ({
    slug: page.slugs[0]
  }));
}
