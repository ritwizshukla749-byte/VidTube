import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center">
      <h1 className="text-8xl font-black text-red-500">404</h1>

      <h2 className="mt-6 text-3xl font-bold text-white">
        Page not found
      </h2>

      <p className="mt-3 max-w-md text-slate-400">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <Link to="/">
        <Button className="mt-8 rounded-full px-8">
          Go Home
        </Button>
      </Link>
    </div>
  );
}

export default NotFound;
