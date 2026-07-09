import { useEffect } from "react";
import api from "./api/axios";

function App() {
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/healthcheck");
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-green-400 text-4xl">
      VidTube 🚀
    </div>
  );
}

export default App;
