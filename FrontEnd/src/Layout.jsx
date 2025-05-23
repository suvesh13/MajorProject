import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div
      className=" bg-cover bg-center bg-no-repeat text-white flex flex-col"
      style={{ backgroundImage: "url('/Image/bgImage.webp')" }}
    >
      <Header />
      
      <main className="flex-grow flex justify-center px-4 py-6">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
