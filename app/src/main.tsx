import './index.css';
import ReactDOM from 'react-dom/client';
import { Router } from './router.tsx';
import axios from 'axios';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query.ts';
import { NextUIProvider } from '@nextui-org/react';

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <NextUIProvider className={'flex flex-grow flex-col'}>
      <Router />
    </NextUIProvider>
  </QueryClientProvider>,
);
