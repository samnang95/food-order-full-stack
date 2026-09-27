import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes';
import { ThemeProvider, LanguageProvider } from './core';
import { AuthProvider } from './features/auth/auth_provider';
import { CartProvider } from './features/cart/cart_provider';
import { FavoritesProvider } from './features/favorites';
import { NotificationsProvider } from './features/notifications';
import { RewardsProvider } from './features/rewards';
import { ScheduleProvider } from './features/schedule';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <NotificationsProvider>
                <RewardsProvider>
                  <ScheduleProvider>
                    <RouterProvider router={appRouter} />
                  </ScheduleProvider>
                </RewardsProvider>
              </NotificationsProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
