import React from 'react';
import Header from './Header/Header';
import Footer from './Footer/Footer';
import { Outlet, useLocation } from 'react-router-dom';

function Layout() {
  const location = useLocation(); // <-- Get the current path

  return (
    <div
      className="bg-cover bg-center bg-no-repeat text-white flex flex-col min-h-screen"
      style={{ backgroundImage: "url('/Image/bgII.jpg')" }}
    >
      <Header />

      <main className="flex-grow flex justify-center px-4 py-6">
        <div className="w-full max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
