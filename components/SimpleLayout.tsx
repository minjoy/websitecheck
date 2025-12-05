'use client';

import Header from './Header';

export default function SimpleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}
