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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Helmet>
        <title>Login | VidTube</title>
      </Helmet>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-10 shadow-2xl shadow-black/40">
        {/* Logo */}
        <Link to="/" className="mb-10 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 text-xl font-black text-black shadow-lg">
            V
          </div>

          <span className="text-3xl font-bold tracking-tight text-white">
            <span className="transition-colors duration-300 hover:text-red-500">
              Vid
            </span>
            Tube
          </span>
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white">Welcome Back</h1>

          <p className="mt-2 text-slate-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
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
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-12 text-white placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                {...register("password", {
                  required: "Password is required",
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
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
            className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500 hover:shadow-red-800/40 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="font-semibold text-white transition-colors hover:text-red-400"
          >
            Create Account →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
