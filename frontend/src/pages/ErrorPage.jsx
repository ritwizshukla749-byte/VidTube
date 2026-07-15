import { useRouteError, Link } from "react-router-dom";
import { Button } from "../components/ui/button";

function ErrorPage() {
  const error = useRouteError();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <h1 className="text-7xl font-black text-red-500">
        Oops!
      </h1>

      <p className="mt-4 text-slate-300">
        {error?.statusText || error?.message || "Something went wrong."}
      </p>

      <Link to="/">
        <Button className="mt-8 rounded-full">
          Return Home
        </Button>
      </Link>
    </div>
  );
}

export default ErrorPage;
