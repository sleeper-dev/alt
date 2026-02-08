import { useNavigate } from "react-router";
import { useAuth } from "./auth.context.jsx";
import { useState } from "react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2efe6] p-6">
      <form
        className="w-full max-w-md rounded-sm border-4 border-black/90 bg-[#fff9f1] p-6 shadow-none"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-4 font-mono text-2xl leading-tight tracking-wider">
          {"// LOGIN //"}
        </h1>

        <div className="mb-5 flex items-center gap-3">
          <div className="inline-block h-6 w-12 bg-black" />
          <div className="h-6 flex-1 bg-linear-to-r from-[#ff6b6b] via-[#ffd166] to-[#6bf0ff] opacity-90" />
        </div>

        <label className="mb-2 block text-sm font-semibold" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. ishy"
          className="mb-4 w-full border-2 border-black/90 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
          required
        />

        <label className="mb-2 block text-sm font-semibold" htmlFor="password">
          Password
        </label>
        <div className="relative mb-4">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border-2 border-black/90 bg-transparent px-3 py-2 font-mono text-sm focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute top-1/2 right-1 -translate-y-1/2 border-2 border-black/90 bg-white/80 px-2 py-1 text-xs font-semibold"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-red-800">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer border-4 border-black/90 bg-[#d0f5be] px-4 py-2 text-sm font-bold tracking-wide uppercase transition-transform hover:-translate-y-px active:translate-y-0"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};
