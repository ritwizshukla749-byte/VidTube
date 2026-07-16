import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginUser } from "../services/auth.services.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice.js";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await loginUser(data);

      dispatch(loginSuccess(response.data.user));
      toast.success("Logged in successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b17] px-4">
      <Helmet>
        <title>Login | VidTube</title>
      </Helmet>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0d1224] p-10 shadow-2xl shadow-black/40">
        {/* Logo */}
        <Link to="/" className="mb-10 flex flex-col items-center gap-2">
          <img src="/logo.png" alt="VidTube" className="h-20 w-auto object-contain" />

          <span className="text-4xl font-bold tracking-tight">
            <span className="text-white">Vid</span>
            <span className="text-red-500">Tube</span>
          </span>
        </Link>

        {/* Header */}
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
        </div>

        <hr className="mb-8 border-slate-800" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                {...register("email", {
                  required: "Email is required",
                })}
              />
            </div>

            {errors.email && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-12 text-white placeholder:text-slate-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 font-semibold text-white shadow-lg shadow-red-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-xl hover:shadow-red-800/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-red-500 underline-offset-4 transition-all hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
