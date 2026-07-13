import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Watch from "../pages/Watch";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import NotFound from "../pages/NotFound";
import MainLayout from "../layouts/MainLayout";
import Channel from "../pages/Channel";
import History from "../pages/History";
import Liked from "../pages/Liked";
const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/liked",
        element: <Liked />,
      },
      {
        path: "/watch/:videoId",
        element: <Watch />,
      },
      {
        path: "/history",
        element: <History />,
      },
      {
        path: "/channel/:username",
        element: <Channel />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/upload",
        element: <Upload />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
