import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes';
import { ThemeProvider, LanguageProvider } from './core';
import { AuthProvider } from './features/auth/auth_provider';
import { CartProvider } from './features/cart/cart_provider';
import { FavoritesProvider } from './features/favorites';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <RouterProvider router={appRouter} />
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
