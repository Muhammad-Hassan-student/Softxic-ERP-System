'use client';

import NextTopLoader from 'next-top-loader';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader
        color="var(--color-erp-primary)"
        height={3}
        showSpinner={false}
        shadow="0 0 10px var(--color-erp-primary)"
      />
      {children}
    </>
  );
}
