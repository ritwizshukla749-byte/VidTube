import { useForm } from "react-hook-form";
import {loginUser} from '../services/auth.services.js'
import toast from 'react-hot-toast';
import {useDispatch } from 'react-redux';
import {loginSuccess} from '../store/authSlice.js'
import { useNavigate } from "react-router-dom";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

const dispatch = useDispatch();
const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await loginUser(data);

      dispatch(loginSuccess(response.data.user));

      toast.success(response.message);
      
      navigate("/");

    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 rounded-xl p-8 shadow-lg">
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

          <button className="w-full rounded-lg bg-green-500 py-3 text-black font-semibold hover:bg-green-400">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
