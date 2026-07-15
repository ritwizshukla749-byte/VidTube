import { useForm } from "react-hook-form";
import { useState } from "react";
import { loginUser } from "../services/auth.services.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice.js";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <Helmet>
        <title>Login | VidTube</title>
      </Helmet>
      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 shadow-lg">
        <h1 className="text-3xl text-white font-bold mb-6 text-center">
          Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              {...register("email", {
                required: "Email is required",
              })}
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              {...register("password", {
                required: "Password is required",
              })}
            />

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-red-600 py-3 text-white font-semibold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
