import { Navigate } from "react-router";
import { useAuth } from "../features/auth/auth.context.jsx";
import { SocketProvider } from "../features/socket/SocketProvider.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f2efe6]">
        <div className="font-mono text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <SocketProvider>{children}</SocketProvider>;
};

export default ProtectedRoute;
