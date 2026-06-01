import React from "react";
import Header from "../../../components/ui/Header";
import { Outlet } from "react-router-dom";

export default function SharedLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
