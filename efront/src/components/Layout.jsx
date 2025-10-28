import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <main className='container mx-auto p-4'>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
