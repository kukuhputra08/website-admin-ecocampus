import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, Lock, Mail } from "lucide-react";

import { loginAdmin } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Password is required.");
      return;
    }

    try {
      setIsLoading(true);

      await loginAdmin(email, password);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email format.");
      } else if (error.code === "auth/user-not-found") {
        setErrorMessage("User not found.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Wrong password.");
      } else if (error.code === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage(error.message || "Failed to login.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
        <div className="hidden bg-emerald-600 p-10 text-white md:block">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Leaf size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">EcoCampus</h1>
              <p className="text-sm text-emerald-100">Admin Panel</p>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Manage your campus sustainability system.
            </h2>

            <p className="mt-5 leading-7 text-emerald-100">
              Review reports, manage challenges, monitor events, and support
              green campus activities from one dashboard.
            </p>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                <Leaf size={24} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  EcoCampus
                </h1>
                <p className="text-sm text-slate-500">Admin Panel</p>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-800">Login Admin</h2>
          <p className="mt-2 text-slate-500">
            Sign in to manage your EcoCampus dashboard.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Email
              </label>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                <Mail size={18} className="text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@if.its.ac.id"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3">
                <Lock size={18} className="text-slate-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an admin account?{" "}
            <Link
              to="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;