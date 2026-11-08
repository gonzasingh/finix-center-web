import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, onAuthChange } from '../services';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => onAuthChange((user) => setState({ loading: false, user })), []);
  const value = useMemo(() => ({
    ...state,
    login: (mode, identifier, password) => api.signIn({ mode, identifier, password }),
    logout: () => api.signOut(),
  }), [state]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
