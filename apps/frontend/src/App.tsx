import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import OrgsPage from "./pages/OrgsPage";
import OrgPage from "./pages/OrgPage";
import BoardPage from "./pages/BoardPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <OrgsPage />
            </RequireAuth>
          }
        />
        <Route
          path="/org/:orgId"
          element={
            <RequireAuth>
              <OrgPage />
            </RequireAuth>
          }
        />
        <Route
          path="/board/:boardId"
          element={
            <RequireAuth>
              <BoardPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
