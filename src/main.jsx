import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { BookmarksProvider } from "./context/BookmarksContext";
import ScrollToTop from "./components/ScrollToTop";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <BookmarksProvider>
          <App />
        </BookmarksProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
