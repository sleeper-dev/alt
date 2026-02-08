import { AuthProvider } from "../features/auth/auth.context.jsx";
import { SocketProvider } from "../features/socket/SocketProvider.jsx";

const Providers = ({ children }) => {
  return (
    <AuthProvider>
      <SocketProvider>{children}</SocketProvider>
    </AuthProvider>
  );
};

export default Providers;
