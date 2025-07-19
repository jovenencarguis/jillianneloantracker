"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-headline font-bold text-primary animate-fade-in-down">
          Jilliane LoadBuddy
        </h1>
        <p className="mt-2 text-lg text-muted-foreground animate-fade-in-up">
          Your friendly money lending tracker.
        </p>
      </div>
    </div>
  );
}
