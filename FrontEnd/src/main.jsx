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
import ImageResult from './components/ImageResult.jsx';
import VideoResult from './components/VideoResult.jsx';

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
        path: "image-result", // ✅ Add this route
        element: <ImageResult />,
      },
      {
        path: "video",
        element: <VideoPage />,
      },
      {
        path: "video-result",
        element: <VideoResult />, // ✅ Route to show after clicking Predict on video
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
