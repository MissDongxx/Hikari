'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { signUp, signInWithGoogle } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Chrome, AlertCircle } from 'lucide-react';

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get error from URL params
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signUp, router);
    setIsSubmitting(false);
  };

  const handleGoogleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithGoogle, null);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/signin"
          className="rounded-md p-2 transition-colors hover:bg-muted"
          prefetch={false}
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div />
      </div>
      <div className="flex items-center justify-center flex-1">
        <Card className="w-full max-w-md">
          <CardContent className="grid gap-4 px-4 pb-4 my-10">
            <div className="space-y-1 text-center">
              <h2 className="text-2xl font-bold">Sign Up</h2>
              <p className="text-muted-foreground my-2">
                Enter your details below to create an account
              </p>
            </div>
            {/* Error Message Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">{error}</p>
                  {errorDescription && (
                    <p className="text-red-500">{errorDescription}</p>
                  )}
                </div>
              </div>
            )}
            <form
              noValidate={true}
              className="grid gap-4"
              onSubmit={(e) => handleSubmit(e)}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" name="password" required />
              </div>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Sign up
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              <span>Sign up with email and password</span>
            </div>
            <div className="flex justify-center">
              <Link
                href="/signin"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Already have an account? Sign in
              </Link>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-2">
              <form onSubmit={handleGoogleSignin}>
                <Button
                  variant="outline"
                  type="submit"
                  className="w-full"
                  loading={isSubmitting}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Sign up with Google
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}

function ArrowLeftIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
