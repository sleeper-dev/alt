import { useNavigate } from "react-router";
import { useAuth } from "./auth.context.jsx";
import { useState } from "react";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(username, email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f2efe6] p-3 sm:p-6">
      <form
        className="w-full max-w-md rounded-sm border-4 border-black/90 bg-[#fff9f1] p-4 shadow-none sm:p-6"
        onSubmit={handleSubmit}
      >
        <h1 className="mb-4 font-mono text-xl leading-tight tracking-wider sm:text-2xl">
          {"// REGISTER //"}
        </h1>

        <div className="mb-5 flex items-center gap-3">
          <div className="inline-block h-5 w-10 bg-black sm:h-6 sm:w-12" />

          <div className="h-5 flex-1 bg-linear-to-r from-[#ff6b6b] via-[#ffd166] to-[#6bf0ff] opacity-90 sm:h-6" />
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

        <label className="mb-2 block text-sm font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g. ishy@example.com"
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
            className="w-full border-2 border-black/90 bg-transparent px-3 py-2 pr-18 font-mono text-sm focus:outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute top-1/2 right-1 -translate-y-1/2 border-2 border-black/90 bg-white/80 px-2 py-1 text-[10px] font-semibold sm:text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {error && (
          <div className="mb-4 text-sm wrap-break-word text-red-800">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer border-4 border-black/90 bg-[#d0f5be] px-4 py-2 text-sm font-bold tracking-wide uppercase transition-transform hover:-translate-y-px active:translate-y-0"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};
