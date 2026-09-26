import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes';
import { ThemeProvider } from './core';
import { AuthProvider } from './features/auth/auth_provider';
import { CartProvider } from './features/cart/cart_provider';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={appRouter} />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
