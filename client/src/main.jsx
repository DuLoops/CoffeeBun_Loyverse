import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import App from './App.jsx'
import Baker from './pages/Baker.jsx'
import Baristar from './pages/Baristar.jsx'
import Customer from './pages/Customer.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/baker", element: <Baker /> },
  { path: "/baristar", element: <Baristar /> },
  { path: "/customer", element: <Customer /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
