import React, { createContext, useState, useContext, ReactNode } from 'react';

export const lightTheme = {
  isDark: false,
  background: '#FFFAF8',
  card: '#FFFFFF',
  text: '#49313C',
  textMuted: '#888888',
  primary: '#BC6280',
  border: '#F0DDE4',
};

export const darkTheme = {
  isDark: true,
  background: '#121212',
  card: '#1E1E1E',
  text: '#F5F5F5',
  textMuted: '#A0A0A0',
  primary: '#E07B99',
  border: '#333333',
};

type ThemeContextType = {
  theme: typeof lightTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark(!isDark);
  const theme = isDark ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};