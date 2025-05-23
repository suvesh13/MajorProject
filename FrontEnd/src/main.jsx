import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import HomePage from './components/HomePage.jsx'
import ImagePage from './components/ImagePage.jsx'
import VideoPage from './components/VideoPage.jsx'


const router = createBrowserRouter([
  {
    path:"/",
    element:<Layout/>,
    children:[
      {
        path:"",
        element:<HomePage/>
      },
      {
        path:"image",
        element:<ImagePage/>
      },
      {
        path:"video",
        element:<VideoPage/>
      }
    ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
