import Link from 'next/link';
import { getBlogSource } from '@/lib/content-source';
import { getPostData } from '@/lib/mdx-parser';

export default async function Page({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale } = await params;
  const blog = getBlogSource(locale);
  const posts = blog.getPages();

  // Format date like "Sat Aug 03 2024"
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }).replace(/,/g, '');
  };

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
          Hikari Blog
        </h1>
        <p className="text-lg text-white/80">
          Design language and ease of use
        </p>
      </div>

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
                {formatDate(post.data.date)}
              </p>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
