import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth.services";
function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      formData.append("avatar", data.avatar[0]);

      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      const response = await registerUser(formData);

      toast.success(response.message);

      navigate("/login");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl text-white font-bold mb-6 text-center">
          Register
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              {...register("fullName", {
                required: "Full Name is required",
              })}
            />

            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white"
              {...register("username", {
                required: "Username is required",
              })}
            />

            {errors.username && (
              <p className="text-red-500 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
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
          <div>
            <label className="text-white text-sm">Avatar *</label>

            <input
              type="file"
              accept="image/*"
              className="w-full text-white"
              {...register("avatar", {
                required: "Avatar is required",
              })}
            />

            {errors.avatar && (
              <p className="text-red-500 text-sm mt-1">
                {errors.avatar.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-white text-sm">Cover Image (Optional)</label>

            <input
              type="file"
              accept="image/*"
              className="w-full text-white"
              {...register("coverImage")}
            />
          </div>

          <button className="w-full rounded-lg bg-green-500 py-3 text-black font-semibold hover:bg-green-400">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
