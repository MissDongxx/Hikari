import Link from 'next/link';

// This root-level not-found.tsx must include full html/body structure
// because it can be rendered outside the [locale] layout
export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
          <p className="mt-2 text-gray-500">
            The page you are looking for does not exist.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Go Home
          </Link>
        </div>
      </body>
    </html>
  );
}
