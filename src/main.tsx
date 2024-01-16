import React from "react";
import ReactDOM from "react-dom/client";
import Home from "@/app/Home";

import { ThemeProvider } from "@material-tailwind/react";

import "@/app/globals.css";
import "./demos/ipc";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  </React.StrictMode>
);

postMessage({ payload: "removeLoading" }, "*");
