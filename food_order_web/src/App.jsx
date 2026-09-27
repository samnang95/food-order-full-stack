import { RouterProvider } from 'react-router-dom';
import { appRouter } from './routes';
import { ThemeProvider, LanguageProvider } from './core';
import { AuthProvider } from './features/auth/auth_provider';
import { CartProvider } from './features/cart/cart_provider';
import { FavoritesProvider } from './features/favorites';
import { NotificationsProvider } from './features/notifications';
import { RewardsProvider } from './features/rewards';
import { ScheduleProvider } from './features/schedule';
import { GroupOrderProvider } from './features/group_order';
import { DietaryProvider } from './features/dietary';
import { DriverTipProvider } from './features/driver_tip';

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
                    <GroupOrderProvider>
                      <DietaryProvider>
                        <DriverTipProvider>
                          <RouterProvider router={appRouter} />
                        </DriverTipProvider>
                      </DietaryProvider>
                    </GroupOrderProvider>
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
