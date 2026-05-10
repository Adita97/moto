import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { Loader } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
}
