import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { CompanyProvider } from './context/CompanyContext.tsx';
import { Toaster } from 'sonner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CompanyProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: '"Mona Sans", sans-serif',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            },
          }}
        />
      </CompanyProvider>
    </AuthProvider>
  </React.StrictMode>
);
