import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Watch from "../pages/Watch";
import Dashboard from "../pages/Dashboard";
import Upload from "../pages/Upload";
import NotFound from "../pages/NotFound";
import ErrorPage from "../pages/ErrorPage";
import MainLayout from "../layouts/MainLayout";
import Channel from "../pages/Channel";
import History from "../pages/History";
import Liked from "../pages/Liked";
import Playlists from "../pages/Playlists";
import PlaylistDetails from "../pages/PlaylistDetails";
import ProtectedRoute from "../components/common/ProtectedRoute";




const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/watch/:videoId",
        element: <Watch />,
      },
      {
        path: "/channel/:username",
        element: <Channel />,
      },
      {
        path: "/playlists/:playlistId",
        element: <PlaylistDetails />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/playlists",
            element: <Playlists />,
          },
          {
            path: "/liked",
            element: <Liked />,
          },
          {
            path: "/history",
            element: <History />,
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
    ],
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorPage />,
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
