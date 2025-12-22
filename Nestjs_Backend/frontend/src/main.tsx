import React from 'react';  // ← ADD THIS if missing (explicit import for React references)
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';  // Adjust path if your App is elsewhere
import './index.css';  // Optional: Your global styles

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
