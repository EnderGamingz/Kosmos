import './index.css';
import ReactDOM from 'react-dom/client';
import { Router } from './router.tsx';
import axios from 'axios';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query.ts';

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Router />
  </QueryClientProvider>,
);
