import Link from 'next/link';
import { getBlogSource } from '@/lib/content-source';
import { getPostData } from '@/lib/mdx-parser';
import { HeroGradient } from '@/components/hero-gradient';
import { formatDate } from '@/lib/utils';
import { getTranslations } from 'next-intl/server';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale } = await params;
  const blog = getBlogSource(locale);
  const posts = blog.getPages();
  const t = await getTranslations({ locale, namespace: 'blog' });

  // Enrich posts with metadata
  const enrichedPosts = posts.map((post: any) => {
    const slug = post.slugs[0];
    const { data: metadata } = getPostData(slug, locale, 'blog');
    return {
      ...post,
      data: {
        ...post.data,
        ...metadata
      }
    };
  });

  return (
    <>
      {/* Hero Section with Gradient Background */}
      <HeroGradient>
        <h1 className="mb-2 text-3xl font-bold text-white">
          {t('title')}
        </h1>
        <p className="text-lg text-white/80">
          {t('description')}
        </p>
      </HeroGradient>

      {/* Blog Posts Grid */}
      <main className="container px-4 py-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {enrichedPosts.map((post: any) => (
            <Link
              key={post.url}
              href={post.url}
              className="flex flex-col group"
            >
              <h2 className="text-base font-semibold mb-2 group-hover:underline">
                {post.data.title || 'Untitled'}
              </h2>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {post.data.description || 'Blog Post'}
              </p>

              <p className="mt-auto text-xs text-muted-foreground/60 uppercase tracking-wider">
                {post.data.date ? formatDate(post.data.date) : ''}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
