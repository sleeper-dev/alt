import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../../shared/utils/axios.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });

    const { accessToken, user } = res.data;

    localStorage.setItem("accessToken", accessToken);
    setUser(user);

    return user;
  };

  const register = async (username, email, password) => {
    const res = await api.post("/auth/register", { username, email, password });

    const { accessToken, user } = res.data;

    localStorage.setItem("accessToken", accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {}

    localStorage.removeItem("accessToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
