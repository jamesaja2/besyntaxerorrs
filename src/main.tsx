import { StrictMode } from 'react';
import '@fontsource-variable/inter?display=optional';
import interFontUrl from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import App from './App.tsx';
import './index.css';
import { queryClient } from './lib/queryClient.ts';

if (typeof document !== 'undefined' && !document.querySelector(`link[rel="preload"][href="${interFontUrl}"]`)) {
  const preloadLink = document.createElement('link');
  preloadLink.rel = 'preload';
  preloadLink.as = 'font';
  preloadLink.type = 'font/woff2';
  preloadLink.crossOrigin = 'anonymous';
  preloadLink.href = interFontUrl;
  document.head.appendChild(preloadLink);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  </StrictMode>
);
