"use client";

import Header from "./header";
import Navbar from "./navbar";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header onMenuOpen={() => {}} />
      <div className="flex">
        <Navbar />
        <div className="container m-4 min-h-[100vh]">{children}</div>
      </div>
    </>
  );
};

export default Container;
