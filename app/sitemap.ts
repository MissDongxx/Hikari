import { MetadataRoute } from 'next';
import { blog, getPages } from './source';
import { getURL } from '@/utils/helpers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getURL();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8
    }
  ];

  // Blog posts
  const blogPosts = blog.getPages().map((post) => ({
    url: `${baseUrl}/blog/${post.slugs.join('/')}`,
    lastModified: post.data.date ? new Date(post.data.date) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }));

  // Documentation pages
  const docsPages = getPages().map((page) => ({
    url: `${baseUrl}/docs/${page.slugs.join('/')}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6
  }));

  return [...staticPages, ...blogPosts, ...docsPages];
}
