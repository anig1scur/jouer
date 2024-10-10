import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react';
import Home from './scenes/Home';
import Match from './scenes/Match';

export default function App(): React.ReactElement {
  const BrowserRouter = createBrowserRouter([{
    path: '/',
    element: <Home />,
  }, {
    path: '/:roomId',
    element: <Match />,
  }]);

  return <RouterProvider router={ BrowserRouter } />
}
