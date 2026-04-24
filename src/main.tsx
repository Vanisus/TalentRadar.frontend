import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { notifyError } from './shared/notifications';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';

import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Глобальный обработчик ошибок для всех queries
      throwOnError: false,
    },
  },
});

// Глобальный перехват ошибок queries (например 404 при получении данных)
queryClient.getQueryCache().config.onError = (error) => {
  // Не спамим UNAUTHORIZED — оно обрабатывается отдельно
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return;
  notifyError(error);
};

// Глобальный перехват ошибок mutations
queryClient.getMutationCache().config.onError = (error, _vars, _ctx, mutation) => {
  // Можно отключить глобальный тоаст для специфичных мутаций через meta
  if ((mutation.options as any)?.meta?.silentError) return;
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return;
  notifyError(error);
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Notifications position="top-right" limit={5} />
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
);
