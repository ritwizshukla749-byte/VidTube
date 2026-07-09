import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import "./index.css";
import AppRouter from "./routes/AppRouter";
import { store } from "./store/store.js";
import { Toaster } from "react-hot-toast";
import AuthInitializer from "./components/auth/AuthInitializer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster position="top-right" />

      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </Provider>
  </React.StrictMode>,
);
