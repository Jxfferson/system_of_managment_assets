import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // Este import se procesa rápido, pero el inline style ya cubre el flash
import App from './App.jsx'

// Creamos el root de inmediato
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}