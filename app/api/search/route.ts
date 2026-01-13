import { getPages } from '@/app/source';
import { createSearchAPI } from 'fumadocs-core/search/server';

// TODO: Fix fumadocs integration - commented out due to incompatibility
// export const { GET } = createSearchAPI('advanced', {
//   indexes: getPages().map((page) => ({
//     title: page.data.title || 'Untitled',
//     structuredData: (page.data as any).exports?.structuredData,
//     id: page.url,
//     url: page.url
//   }))
// });

export async function GET() {
  return Response.json({ error: 'Search temporarily disabled' });
}
