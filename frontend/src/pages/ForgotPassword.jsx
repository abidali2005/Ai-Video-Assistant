import { useState } from "react";
import { forgotPassword } from "../api/api";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await forgotPassword(email);

      setMessage(res.message);

     
    } catch (err) {
      setMessage(
        err.response?.data?.detail || "Something went wrong."
      );
    }

    setLoading(false);
  }

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 px-4 transition-colors duration-200">

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-300/30 dark:bg-indigo-700/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-3xl animate-pulse [animation-delay:1s]" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-40 w-40 rounded-full bg-purple-300/20 dark:bg-purple-700/15 blur-3xl animate-pulse [animation-delay:2s]" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-8 shadow-2xl shadow-indigo-200/50 dark:shadow-black/40 backdrop-blur-xl animate-[fadeSlideIn_0.6s_ease-out]">

        {/* Logo / icon badge */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 shadow-lg shadow-indigo-300/50 dark:shadow-none">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
            </svg>
          </div>
        </div>

        <h2 className="mb-1 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
          Forgot Password
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we'll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email field */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9" />
            </svg>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 p-3 pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-300/50 dark:shadow-none transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300/60 dark:hover:shadow-none hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Please wait...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

        </form>

        {message && (
          <p className="mt-5 flex items-start gap-2 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 p-3 text-sm text-indigo-700 dark:text-indigo-300 animate-[fadeSlideIn_0.25s_ease-out]">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
          </p>
        )}

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?
          <Link
            to="/login"
            className="ml-1 font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            Login
          </Link>
        </p>

      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}