
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 3500); // Wait 3.5s before starting fade out

    const pushTimer = setTimeout(() => {
      router.push('/login');
    }, 4000); // Push to login after 4s (allowing 0.5s for fade-out)

    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(pushTimer);
    };
  }, [router]);

  return (
    <div className={`
      flex h-screen w-full flex-col items-center justify-center 
      bg-gradient-to-br from-[#A85AD9] to-[#6200EA]
      text-white transition-opacity duration-500
      ${isFadingOut ? 'opacity-0' : 'opacity-100'}
    `}>
      <div className="text-center flex flex-col items-center">
        <div className="animate-bounce mb-4">
            <span className="text-7xl" role="img" aria-label="money bag">💰</span>
        </div>
        <h1 className="text-5xl font-headline font-bold text-white drop-shadow-lg animate-fade-in-down">
          Friendly LoanBuddy
        </h1>
        <p className="mt-2 text-lg text-white/80 animate-fade-in-up">
          Your Smart Money Lending Companion
        </p>
        <div className="flex space-x-1 mt-6">
            <span className="animate-pulse delay-0 w-3 h-3 bg-white/50 rounded-full"></span>
            <span className="animate-pulse delay-150 w-3 h-3 bg-white/50 rounded-full"></span>
            <span className="animate-pulse delay-300 w-3 h-3 bg-white/50 rounded-full"></span>
        </div>
      </div>
       <div className="absolute bottom-10 w-full max-w-xs overflow-hidden rounded-full bg-white/20 h-2">
            <div className="h-full bg-white animate-progress-bar"></div>
       </div>
    </div>
  );
}
