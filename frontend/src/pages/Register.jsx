import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../services/auth.services";
import { Helmet } from "react-helmet-async";
import {
  User,
  AtSign,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  Image,
  Loader2,
  ChevronDown,
} from "lucide-react";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const avatarFile = watch("avatar");

  useEffect(() => {
    if (avatarFile && avatarFile[0]) {
      const url = URL.createObjectURL(avatarFile[0]);
      setAvatarPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [avatarFile]);

  const coverFile = watch("coverImage");

  useEffect(() => {
    if (coverFile && coverFile[0]) {
      const url = URL.createObjectURL(coverFile[0]);
      setCoverPreview(url);

      return () => URL.revokeObjectURL(url);
    }
  }, [coverFile]);

  const onSubmit = async (data) => {
    try {
      setIsRegistering(true);
      const formData = new FormData();

      formData.append("fullName", data.fullName);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);

      formData.append("avatar", data.avatar[0]);

      if (data.coverImage?.[0]) {
        formData.append("coverImage", data.coverImage[0]);
      }

      await registerUser(formData);

      toast.success("Account created successfully");

      navigate("/login");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b17] px-4 py-10">
      <Helmet>
        <title>Register | VidTube</title>
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
          <h1 className="text-3xl font-extrabold text-white">Create Account</h1>
        </div>

        <hr className="mb-8 border-slate-800" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Full Name + Username */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                  {...register("fullName", {
                    required: "Full Name is required",
                  })}
                />
              </div>

              {errors.fullName && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  placeholder="Username"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-500 transition-colors focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                  {...register("username", {
                    required: "Username is required",
                  })}
                />
              </div>

              {errors.username && (
                <p className="mt-1.5 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

          {/* Email + Password */}
          <div className="flex gap-4">
            <div className="flex-1">
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

            <div className="flex-1">
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
          </div>

          {/* Avatar */}
          <div>
            <p className="mb-2 text-sm font-medium text-white">
              Avatar <span className="text-red-400">*</span>
            </p>

            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-14 w-14 rounded-full border-2 border-slate-700 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-slate-600 bg-slate-800">
                  <Upload className="h-6 w-6 text-slate-500" />
                </div>
              )}

              <div>
                <label className="cursor-pointer rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-white transition-all hover:border-slate-500 hover:bg-slate-700">
                  {avatarPreview ? "Change Avatar" : "+ Upload Avatar"}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("avatar", {
                      required: "Avatar is required",
                    })}
                  />
                </label>

                <p className="mt-1.5 text-xs text-slate-500">
                  PNG, JPG or WEBP
                </p>
              </div>
            </div>

            {avatarPreview && avatarFile?.[0] && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-800/50 px-3 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />

                <span className="text-sm text-slate-300">
                  {avatarFile[0].name}
                </span>
              </div>
            )}

            {errors.avatar && (
              <p className="mt-1.5 text-sm text-red-500">
                {errors.avatar.message}
              </p>
            )}
          </div>

          {/* Cover Image — Collapsible */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50">
            <button
              type="button"
              onClick={() => setShowCover((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-white transition-colors hover:text-slate-300"
            >
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-slate-400" />

                <span className="text-slate-400">Optional</span>

                <span className="text-slate-300">Add Cover Image</span>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-slate-500 transition-transform duration-300 ${
                  showCover ? "rotate-180" : ""
                }`}
              />
            </button>

            {showCover && (
              <div className="border-t border-slate-700 px-4 pb-4 pt-3">
                {coverPreview ? (
                  <div className="relative">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-32 w-full rounded-lg object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => setCoverPreview(null)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center rounded-lg border-2 border-dashed border-slate-600 py-6 transition-colors hover:border-slate-500 hover:bg-slate-800">
                    <Upload className="mb-2 h-8 w-8 text-slate-500" />

                    <span className="text-sm text-slate-400">
                      Click to upload cover
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("coverImage")}
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            type="submit"
            disabled={isRegistering}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-3.5 font-semibold text-white shadow-lg shadow-red-900/30 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-xl hover:shadow-red-800/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-red-500 underline-offset-4 transition-all hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
