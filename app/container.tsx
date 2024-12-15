"use client";

import Header from "./header";
import Navbar from "./navbar";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header onMenuOpen={() => {}} />
      <div className="flex gap-2">
        <Navbar />
        <div className="container mx-auto min-h-[100vh] px-4">{children}</div>
      </div>
    </>
  );
};

export default Container;
