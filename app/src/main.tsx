import './index.css';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import { App } from './app.tsx';

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
