import './index.css';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@lib/query.ts';
import { NextUIProvider } from '@nextui-org/react';
import streamSaver from 'streamsaver';
import LazyRouter from './lazyRouter.tsx';

axios.defaults.withCredentials = true;

// Self-host stream-savers man in the middle scripts for writing streams to file
streamSaver.mitm = '/stream/mitm.html';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <NextUIProvider className={'flex flex-grow flex-col'}>
      <LazyRouter />
    </NextUIProvider>
  </QueryClientProvider>,
);
