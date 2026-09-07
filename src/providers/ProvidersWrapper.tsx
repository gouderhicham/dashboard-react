import { PropsWithChildren } from 'react';

import { AuthProvider } from '@/auth/providers/JWTProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  LayoutProvider,
  LoadersProvider,
  SettingsProvider,
  TranslationProvider
} from '@/providers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const ProvidersWrapper = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TranslationProvider>
              <LayoutProvider>
                <LoadersProvider>{children}</LoadersProvider>
              </LayoutProvider>
          </TranslationProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export { ProvidersWrapper };
