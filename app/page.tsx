'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChilserStore } from '@/lib/store';
import { BrandLogo } from '@/components/BrandLogo';

export default function HomePage() {
  const router = useRouter();
  const { currentUser, authReady } = useChilserStore();

  useEffect(() => {
    if (!authReady) return;
    if (currentUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [authReady, currentUser, router]);

  return (
    <main className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-6">
      <div className="bg-[#FFFEFC] rounded-3xl p-8 shadow-[0_2px_12px_rgba(41,35,31,0.04)] flex flex-col items-center gap-3">
        <BrandLogo variant="light" showSubtitle />
        <p className="text-xs text-[#786D65]">در حال انتقال به سامانه چیلسر یکپارچه...</p>
      </div>
    </main>
  );
}
