import { createContext, useContext, ReactNode, useState } from 'react';

type AuthContextType = {
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const login = async (credentials: { username: string; password: string }) => {
    // TODO: Implement actual authentication logic
    setUser({
      id: '1',
      name: 'Admin User',
      role: 'admin'
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
