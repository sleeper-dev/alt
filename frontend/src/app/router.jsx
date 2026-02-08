import { createBrowserRouter } from "react-router";
import { Login } from "../features/auth/Login.jsx";
import { Register } from "../features/auth/Register.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import { ChatLayout } from "../features/chat/ChatLayout.jsx";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <ChatLayout />
      </ProtectedRoute>
    ),
  },
]);
