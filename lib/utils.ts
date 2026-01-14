import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export async function convertBlobUrlToFile(blobUrl: string) {
  // Security: Only accept blob: URLs to prevent SSRF attacks
  // This prevents attackers from passing internal URLs like http://localhost:6379
  if (!blobUrl.startsWith('blob:')) {
    throw new Error(
      `Security violation: Invalid URL protocol. Expected blob: URL, received: ${blobUrl.slice(0, 20)}...`
    );
  }

  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    const fileName = Math.random().toString(36).slice(2, 9);
    const mimeType = blob.type || "application/octet-stream";
    const file = new File([blob], `${fileName}.${mimeType.split("/")[1]}`, {
      type: mimeType,
    });
    return file;
  } catch (error) {
    throw new Error(`Failed to convert blob URL to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}