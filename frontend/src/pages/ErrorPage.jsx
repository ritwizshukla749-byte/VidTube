import { Button } from "@/components/ui/button";
import { Link, useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <h1 className="text-7xl font-bold text-red-600">Oops!</h1>

      <p className="mt-4 text-2xl font-semibold text-white">
        Something went wrong.
      </p>

      <p className="mt-2 text-slate-400">
        {error?.statusText || error?.message || "An unexpected error occurred."}
      </p>

      <Link to="/" className="mt-8">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}

export default ErrorPage;
