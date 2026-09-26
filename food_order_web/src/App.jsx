import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes';
import { ThemeProvider } from './core';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={appRouter} />
    </ThemeProvider>
  );
}
