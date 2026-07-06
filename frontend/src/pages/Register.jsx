import { useState } from "react";
import { register } from "../api/api";
import { useNavigate, Link } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(value) {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (!value) return { label: "", score: 0 };
    if (score <= 1) return { label: "Weak", score };
    if (score <= 2) return { label: "Fair", score };
    if (score === 3) return { label: "Good", score };
    return { label: "Strong", score };
}

function getErrorMessage(err, fallback) {
    return (
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        fallback
    );
}

// Detects whether the server rejected the request specifically for a
// duplicate/taken username, vs. some other failure.
function isUsernameTakenError(err) {
    const status = err?.response?.status;
    const message = (
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        ""
    ).toString().toLowerCase();

    if (status === 409) return true;
    return message.includes("username") && (message.includes("taken") || message.includes("exist") || message.includes("unique"));
}

export default function Register() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitError, setSubmitError] = useState("");

    const strength = getPasswordStrength(password);

    function validateUsername(value) {
        if (!value.trim()) return "Username is required";
        if (value.trim().length < 3) return "Username must be at least 3 characters";
        return "";
    }

    function validateEmail(value) {
        if (!value.trim()) return "Email is required";
        if (!EMAIL_REGEX.test(value)) return "Enter a valid email address";
        return "";
    }

    function validatePassword(value) {
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter";
        if (!/[0-9]/.test(value)) return "Include at least one number";
        return "";
    }

    function runValidation(field) {
        if (field === "username") return validateUsername(username);
        if (field === "email") return validateEmail(email);
        return validatePassword(password);
    }

    function handleBlur(field) {
        setTouched((t) => ({ ...t, [field]: true }));
        setErrors((err) => ({ ...err, [field]: runValidation(field) }));
    }

    async function handleRegister(e) {

        e.preventDefault();
        setSubmitError("");

        const usernameError = validateUsername(username);
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        setErrors({ username: usernameError, email: emailError, password: passwordError });
        setTouched({ username: true, email: true, password: true });

        if (usernameError || emailError || passwordError) return;

        setIsSubmitting(true);

        try {

            await register(username, email, password);

            alert("Registration Successful");

            navigate("/login");

        } catch (err) {

            if (isUsernameTakenError(err)) {
                setErrors((prev) => ({ ...prev, username: "Username is already taken" }));
                setTouched((t) => ({ ...t, username: true }));
            } else {
                setSubmitError(getErrorMessage(err, "Registration failed. Please try again."));
            }

        } finally {

            setIsSubmitting(false);

        }

    }

    return (

        <div className="relative min-h-screen flex justify-center items-center overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-indigo-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 px-4 transition-colors duration-200">

            {/* Ambient background blobs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-300/30 dark:bg-indigo-700/20 blur-3xl animate-pulse" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-3xl animate-pulse [animation-delay:1s]" />
            <div className="pointer-events-none absolute top-1/4 left-10 h-40 w-40 rounded-full bg-purple-300/20 dark:bg-purple-700/15 blur-3xl animate-pulse [animation-delay:2s]" />

            <form
                onSubmit={handleRegister}
                noValidate
                className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 p-8 shadow-2xl shadow-indigo-200/50 dark:shadow-black/40 backdrop-blur-xl animate-[fadeSlideIn_0.6s_ease-out]"
            >

                {/* Logo / icon badge */}
                <div className="mb-6 flex justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800 shadow-lg shadow-indigo-300/50 dark:shadow-none">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                </div>

                <h2 className="mb-1 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Create your account
                </h2>
                <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Join us — it only takes a minute
                </p>

                {/* Server error banner (non-username errors) */}
                {submitError && (
                    <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-600 dark:text-red-400 animate-[fadeSlideIn_0.25s_ease-out]">
                        <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{submitError}</span>
                    </div>
                )}

                {/* Username field */}
                <div className="mb-4">
                    <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <input
                            placeholder="Username"
                            className={`w-full rounded-xl border bg-white/70 dark:bg-gray-800/70 p-3 pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 ${
                                touched.username && errors.username
                                    ? "border-red-400 dark:border-red-700 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-500/20"
                                    : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
                            }`}
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                // Clear a "taken" error as soon as they start editing again
                                if (errors.username === "Username is already taken") {
                                    setErrors((prev) => ({ ...prev, username: "" }));
                                }
                            }}
                            onBlur={() => handleBlur("username")}
                        />
                    </div>
                    {touched.username && errors.username && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400 animate-[fadeSlideIn_0.2s_ease-out]">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.username}
                        </p>
                    )}
                </div>

                {/* Email field */}
                <div className="mb-4">
                    <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9" />
                        </svg>
                        <input
                            placeholder="Email"
                            className={`w-full rounded-xl border bg-white/70 dark:bg-gray-800/70 p-3 pl-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 ${
                                touched.email && errors.email
                                    ? "border-red-400 dark:border-red-700 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-500/20"
                                    : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
                            }`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => handleBlur("email")}
                        />
                    </div>
                    {touched.email && errors.email && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400 animate-[fadeSlideIn_0.2s_ease-out]">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.email}
                        </p>
                    )}
                </div>

                {/* Password field */}
                <div className="mb-6">
                    <div className="relative">
                        <svg className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z" />
                        </svg>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={`w-full rounded-xl border bg-white/70 dark:bg-gray-800/70 p-3 pl-10 pr-10 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white dark:focus:bg-gray-800 focus:ring-4 ${
                                touched.password && errors.password
                                    ? "border-red-400 dark:border-red-700 focus:border-red-500 focus:ring-red-100 dark:focus:ring-red-500/20"
                                    : "border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-indigo-100 dark:focus:ring-indigo-500/20"
                            }`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={() => handleBlur("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Strength meter */}
                    {password && (
                        <div className="mt-2 animate-[fadeSlideIn_0.2s_ease-out]">
                            <div className="flex gap-1">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                            i < strength.score
                                                ? strength.score <= 1
                                                    ? "bg-red-400 dark:bg-red-500"
                                                    : strength.score <= 2
                                                    ? "bg-amber-400 dark:bg-amber-500"
                                                    : strength.score === 3
                                                    ? "bg-lime-500 dark:bg-lime-500"
                                                    : "bg-emerald-500 dark:bg-emerald-500"
                                                : "bg-gray-200 dark:bg-gray-700"
                                        }`}
                                    />
                                ))}
                            </div>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Strength: <span className="font-medium">{strength.label}</span>
                            </p>
                        </div>
                    )}

                    {touched.password && errors.password && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500 dark:text-red-400 animate-[fadeSlideIn_0.2s_ease-out]">
                            <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {errors.password}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 py-3 font-semibold text-white shadow-lg shadow-indigo-300/50 dark:shadow-none transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300/60 dark:hover:shadow-none hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Creating account...
                        </>
                    ) : (
                        "Register"
                    )}
                </button>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?
                    <Link
                        to="/login"
                        className="ml-1 font-semibold text-indigo-600 dark:text-indigo-400 transition-colors hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                        Login
                    </Link>
                </p>

            </form>

            <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>

    )

}