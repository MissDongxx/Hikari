'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  signInWithEmail,
  signInWithPassword
} from '@/utils/auth-helpers/server';
import { signInWithOAuth } from '@/utils/auth-helpers/client';
import { handleRequest } from '@/utils/auth-helpers/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Chrome, AlertCircle, CheckCircle } from 'lucide-react';

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get status and error from URL params
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const status = searchParams.get('status');
  const statusDescription = searchParams.get('status_description');

  // Get returnUrl for redirect after login
  const returnUrl = searchParams.get('returnUrl');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await handleRequest(e, signInWithPassword, router);
    setIsSubmitting(false);
  };

  const oAuthProviders = [
    {
      name: 'google',
      displayName: 'Google',
      icon: <Chrome className="mr-2 h-4 w-4" />
    }
  ];

  const handleOAuthSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    await signInWithOAuth(e);
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
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
              <h2 className="text-2xl font-bold">Sign In</h2>
              <p className="text-muted-foreground my-2">
                Enter your email below to sign in to your account
              </p>
            </div>
            {/* Success Message Display */}
            {status && (
              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="font-medium">{status}</p>
                  {statusDescription && (
                    <p className="text-green-500">{statusDescription}</p>
                  )}
                </div>
              </div>
            )}
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
              onSubmit={handleSubmit}
            >
              {/* Hidden field for returnUrl */}
              {returnUrl && (
                <input type="hidden" name="returnUrl" value={returnUrl} />
              )}
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
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Sign in
              </Button>
            </form>
            <div className="flex justify-center">
              <Link
                href="/signup"
                className="text-sm font-medium hover:underline underline-offset-4"
                prefetch={false}
              >
                Don't have an account? Sign up
              </Link>
            </div>
            <div className="flex justify-center">
              <Link
                href="/forgot_password"
                className="text-sm font-bold hover:underline underline-offset-4"
                prefetch={false}
              >
                Forgot your password?
              </Link>
            </div>
            <Separator className="my-6" />
            <div className="grid gap-2">
              {oAuthProviders.map((provider) => (
                <form
                  key={provider.name}
                  className="pb-2"
                  onSubmit={(e) => handleOAuthSubmit(e)}
                >
                  <input type="hidden" name="provider" value={provider.name} />
                  <Button
                    variant="outline"
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                  >
                    {provider.icon}
                    Sign in with {provider.displayName}
                  </Button>
                </form>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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

