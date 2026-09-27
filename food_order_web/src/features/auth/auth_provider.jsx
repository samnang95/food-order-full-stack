import PropTypes from 'prop-types';
import { AuthContext } from './auth_context';
import { useAuthStore } from './auth_store';
import { AuthModal } from './components/AuthModal';

export function AuthProvider({ children }) {
  const authStore = useAuthStore();

  return (
    <AuthContext.Provider value={authStore}>
      {children}
      <AuthModal
        isOpen={authStore.isAuthModalOpen}
        mode={authStore.authModalMode}
        onClose={authStore.closeAuthModal}
        onSwitchMode={authStore.setAuthModalMode}
      />
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
