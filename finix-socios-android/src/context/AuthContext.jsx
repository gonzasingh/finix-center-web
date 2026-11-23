import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, onAuthChange } from '../services';
import { hideSplash } from '../native';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => onAuthChange((user) => setState({ loading: false, user })), []);
  useEffect(() => { if (!state.loading) hideSplash(); }, [state.loading]);
  const value = useMemo(() => ({
    ...state,
    login: (identifier, password) => api.signIn({ identifier, password }),
    logout: () => api.signOut(),
  }), [state]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
