import { RouterProvider } from "react-router";
import { router } from "./router.jsx";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff9f1",
            color: "#000",
            border: "4px solid #000",
            fontFamily: "monospace",
            padding: "12px 16px",
          },
          success: {
            style: {
              background: "#d0f5be",
              border: "4px solid #000",
              color: "#000",
            },
          },
          error: {
            style: {
              background: "#ff6b6b",
              border: "4px solid #000",
              color: "#fff",
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
