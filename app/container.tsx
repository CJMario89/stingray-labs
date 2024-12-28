"use client";

import { useState } from "react";
import Header from "./header";
import Navbar from "./navbar";

const Container = ({ children }: { children: React.ReactNode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <Header
        menuOpen={menuOpen}
        onMenuToggle={() => {
          setMenuOpen(!menuOpen);
        }}
      />
      <div className="h-20" />
      <div className="flex">
        <div className="hidden lg:block">
          <Navbar />
        </div>
        <div
          className={`fixed z-[9999] block ${menuOpen ? "h-[100vh]" : "h-0"} w-[100vw] overflow-hidden transition-all duration-300 lg:hidden`}
        >
          <Navbar
            onSelect={() => {
              setMenuOpen(false);
            }}
          />
        </div>
        <div className="container m-4 min-h-[100vh] max-w-none">{children}</div>
      </div>
    </>
  );
};

export default Container;
