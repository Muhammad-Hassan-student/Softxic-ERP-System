'use client';

import NextTopLoader from 'nextjs-toploader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader
        color="var(--color-erp-primary)"
        initialPosition={0.08}
        crawlSpeed={200}
        height={3}
        crawl
        showSpinner={false}
        easing="ease"
        speed={200}
        shadow="0 0 10px var(--color-erp-primary)"
      />

      <div className="min-h-screen bg-background">
        {children}
      </div>
    </>
  );
}
