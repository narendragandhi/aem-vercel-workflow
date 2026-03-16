import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './LandingPage';
import './index.css';

// ReactFlow styles - required for proper canvas rendering
import '@reactflow/core/dist/style.css';
import '@reactflow/controls/dist/style.css';
import '@reactflow/minimap/dist/style.css';

console.log('AEMFlow app loaded!');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
);