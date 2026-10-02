import { LocalDB } from '../../../core/db/local_db';
import { DBKeys } from '../../../core/db/db_keys';
import type { AuthSession } from '../../../domain/auth/entities/auth_session';
import type { User } from '../../../domain/auth/entities/user';

export class AuthLocalDataSource {
  saveSession(session: AuthSession): void {
    LocalDB.setString(DBKeys.AUTH_TOKEN, session.token);
    LocalDB.setJson(DBKeys.USER_PROFILE, session.user);
  }

  getSession(): AuthSession | null {
    const token = LocalDB.getString(DBKeys.AUTH_TOKEN);
    const user = LocalDB.getJson<User>(DBKeys.USER_PROFILE);

    if (!token || !user) {
      return null;
    }

    return {
      token,
      user,
    };
  }

  getUser(): User | null {
    return LocalDB.getJson<User>(DBKeys.USER_PROFILE);
  }

  clearSession(): void {
    LocalDB.remove(DBKeys.AUTH_TOKEN);
    LocalDB.remove(DBKeys.USER_PROFILE);
  }

  isAuthenticated(): boolean {
    const token = LocalDB.getString(DBKeys.AUTH_TOKEN);
    return Boolean(token && token.length > 5);
  }
}
