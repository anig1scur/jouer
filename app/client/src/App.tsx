import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import Home from './scenes/Home';

export default function App(): React.ReactElement {
  const BrowserRouter = createBrowserRouter([{
    path: '/',
    element: <Home />,
  }])

  return <RouterProvider router={ BrowserRouter } />
}
