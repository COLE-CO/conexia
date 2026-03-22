import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { SidebarProvider } from './context/SidebarContext';
import Sidebar from './components/Sidebar';
import CompanyGuard from './components/CompanyGuard';
import FamilyOfficePage from './pages/FamilyOfficePage';
import React from 'react';

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-neutral-bg overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Rutas con sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <DashboardPage />
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/family-office"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <CompanyGuard>
                  <FamilyOfficePage />
                </CompanyGuard>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flujo-de-caja"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <h1 className="p-6">Flujo de Caja</h1>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/facturas"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <h1 className="p-6">Facturas</h1>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <h1 className="p-6">Reportes</h1>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ajustes"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <h1 className="p-6">Ajustes</h1>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <ProtectedRoute>
              <LayoutWithSidebar>
                <h1 className="p-6">Notificaciones</h1>
              </LayoutWithSidebar>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
