import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBlogSource } from '@/lib/content-source';
import { createMetadata } from '@/utils/metadata';
import { buttonVariants } from '@/components/ui/button';
import { Control } from './page.client';

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
          {page.data.title}
        </h1>
        <Link
          href={`/${locale}/blog`}
          className={buttonVariants({ size: 'sm', variant: 'secondary' })}
        >
          Back
        </Link>
      </div>
      <article className="container px-4 py-8">
        <div className="prose max-w-none">
          <p>Blog post content would be rendered here.</p>
          <p>Page data: {JSON.stringify(page.data, null, 2)}</p>
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

  return createMetadata({
    title: page.data.title,
    description: 'Blog post'
  });
}

export async function generateStaticParams({ params }: { params: { locale: string } }): Promise<Omit<Param, 'locale'>[]> {
  const blog = getBlogSource(params.locale);
  return blog.getPages().map((page: any) => ({
    slug: page.slugs[0]
  }));
}
