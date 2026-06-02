import React from "react";
import Header from "../../../components/ui/Header";
import Footer from "@/components/home/Footer";
import { Outlet, useLocation } from "react-router-dom";  
import { useLanguage } from "../../../context/LanguageContext";

// TouristLayout wraps tourist-specific pages with a common header and layout.
export default function TouristLayout() {
  const { isRTL } = useLanguage();
  const location = useLocation();
  const pathname = String(location.pathname || "");
  const hideHeader =
    pathname.startsWith("/tourist/pay") ||
    pathname.startsWith("/tourist/create-plan") ||
    pathname.startsWith("/tourist/plans") ||
    pathname.startsWith("/tourist/available-guides") ||
    pathname.startsWith("/available-guides");

  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      <main className={`${isRTL ? "text-right" : "text-left"}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Note: The Outlet component is a placeholder that renders the matched child route component. 
// This allows us to have a consistent header and layout for all tourist-related pages while changing the main content based on the route.
