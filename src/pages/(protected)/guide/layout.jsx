import React from "react";
import Header from "../../../components/ui/Header";
import { Outlet } from "react-router-dom";
import Footer from "@/components/home/Footer";

export default function GuideLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
