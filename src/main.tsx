import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import GamePage from './components/GamePage.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GamePage onExit={() => {}} />
  </StrictMode>,
);
