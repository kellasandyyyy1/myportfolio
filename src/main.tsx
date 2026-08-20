import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* The site stays one continuous page; routes exist for deep-linking and
        back/forward, and resolve to a scroll position rather than a view swap. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
