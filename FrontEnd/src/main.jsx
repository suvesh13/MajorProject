import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './Layout.jsx';
import HomePage from './components/HomePage.jsx';
import ImagePage from './components/ImagePage.jsx';
import VideoPage from './components/VideoPage.jsx';
import Start from './Home/Start.jsx'; // Make sure this path is correct
import AbstactPage from './components/AbstactPage.jsx';

const router = createBrowserRouter([
  // Abstract with its own route (and layout)
  {
    path: "/",
    element: <Start />, // Standalone layout for Abstract
  },
  {
    path:"/abstact",
    element:<AbstactPage/>
  },

  // Other pages using shared Layout
  {
    path: "/main",
    element: <Layout />,
    children: [
      {
        path: "home",
        element: <HomePage />,
      },
      {
        path: "image",
        element: <ImagePage />,
      },
      {
        path: "video",
        element: <VideoPage />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
