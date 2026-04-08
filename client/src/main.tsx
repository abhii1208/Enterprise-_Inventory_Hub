import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { router } from "./app/router";
import { queryClient } from "./app/query-client";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border !border-line !bg-panel !text-ink !shadow-panel",
            title: "!text-sm !font-semibold",
            description: "!text-sm !text-muted"
          }
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);

