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

  return <div className='bg-bg bg-repeat min-h-screen bg-contain animate-slidein bg-bgc'><RouterProvider router={ BrowserRouter } /></div>
}
