import './index.css';
import ReactDOM from 'react-dom/client';
import { Router } from './router.tsx';
import axios from 'axios';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

axios.defaults.withCredentials = true;

export const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <Router />
  </QueryClientProvider>,
);
