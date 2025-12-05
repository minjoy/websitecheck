'use client';

import { ReactNode } from 'react';
import { ToastProvider } from './Toast';
import ProfileCollectionManager from './ProfileCollectionManager';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ToastProvider>
      <ProfileCollectionManager />
      {children}
    </ToastProvider>
  );
}
