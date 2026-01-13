import { MetadataRoute } from 'next';
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
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9
    }
  ];

  // TODO: Add documentation pages once fumadocs integration is fixed
  // const docsPages = getPages().map((page) => ({
  //   url: `${baseUrl}/docs/${page.slugs.join('/')}`,
  //   lastModified: new Date(),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6
  // }));

  return staticPages; // [...staticPages, ...docsPages];
}
