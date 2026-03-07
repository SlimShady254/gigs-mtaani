import { type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuthStore } from "./state/authStore";
import "./styles-premium.css";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  if (!accessToken) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { accessToken } = useAuthStore();

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={accessToken ? "/app" : "/auth"} replace />} />
    </Routes>
  );
}
