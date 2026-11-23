import type { Metadata } from 'next';
import './globals.css';
import { ChilserStoreProvider } from '@/lib/store';
import { ToastContainer } from '@/components/ui/Primitives';

export const metadata: Metadata = {
  title: 'چیلسر یکپارچه | سامانه مدیریت تولید، فروش و عملیات قهوه',
  description:
    'سامانه جامع مدیریت تولید، برشته‌کاری، انبار، فروش، مشتریان و امور مالی برند قهوه چیلسر',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'چیلسر یکپارچه | سامانه مدیریت تولید، فروش و عملیات قهوه',
    description:
      'سامانه جامع مدیریت تولید، برشته‌کاری، انبار، فروش، مشتریان و امور مالی برند قهوه چیلسر',
    type: 'website',
    locale: 'fa_IR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'چیلسر یکپارچه',
    description:
      'سامانه جامع مدیریت تولید، برشته‌کاری، انبار، فروش، مشتریان و امور مالی برند قهوه چیلسر',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body
        suppressHydrationWarning
        className="bg-[#F7F4EF] text-[#29231F] antialiased"
      >
        <ChilserStoreProvider>
          {children}
          <ToastContainer />
        </ChilserStoreProvider>
      </body>
    </html>
  );
}
