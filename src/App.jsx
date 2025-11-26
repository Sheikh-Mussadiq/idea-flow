import { lazy, Suspense } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { NotificationsProvider } from "./context/NotificationsContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BoardProvider } from "./context/BoardContext";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const BoardPage = lazy(() => import("./pages/BoardPage.jsx"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage.jsx"));
const SettingsPage = lazy(() => import("./pages/SettingsPage.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const LoginSignUpPage = lazy(() => import("./pages/LoginSignUpPage.jsx"));

// Loading component
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <ThemeProvider>
      <NotificationsProvider>
        <BoardProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Auth Route */}
                    <Route path="/auth" element={<LoginSignUpPage />} />

                    {/* Protected Routes */}
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* Board Routes with dynamic IDs */}
                    <Route path="/boards/:boardId" element={
                        <ProtectedRoute>
                            <BoardPage />
                        </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="flow" replace />} />
                      <Route path="flow" element={<BoardPage initialView="flow" />} />
                      <Route path="kanban" element={<BoardPage initialView="kanban" />} />
                      <Route path="table" element={<BoardPage initialView="table" />} />
                    </Route>

                    {/* Legacy routes - redirect to new structure */}
                    <Route path="/flow" element={<Navigate to="/" replace />} />
                    <Route path="/tasks" element={<Navigate to="/" replace />} />

                    {/* Global routes */}
                    <Route path="/analytics" element={
                        <ProtectedRoute>
                            <AnalyticsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    } />

                    {/* 404 - Catch all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </BoardProvider>
      </NotificationsProvider>
    </ThemeProvider>
  </AuthProvider>
);

export default App;


