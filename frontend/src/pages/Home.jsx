import { useSelector } from "react-redux";

function Home() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Home</h1>

      <h2>
        Authenticated:
        {isAuthenticated ? " Yes" : " No"}
      </h2>

      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

export default Home;
