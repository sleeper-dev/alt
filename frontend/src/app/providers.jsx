import { AuthProvider } from "../features/auth/auth.context.jsx";

const Providers = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default Providers;
