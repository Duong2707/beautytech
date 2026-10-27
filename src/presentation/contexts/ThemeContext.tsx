import React, { createContext, useState, useContext, ReactNode } from 'react';

export const lightTheme = {
  isDark: false,
  background: '#FFFAF8', // Màu nền sáng
  card: '#FFFFFF',       // Màu nền thẻ
  text: '#49313C',       // Màu chữ chính
  textMuted: '#888888',  // Màu chữ phụ
  primary: '#BC6280',    // Màu hồng chủ đạo
  border: '#F0DDE4',     // Màu viền
};

export const darkTheme = {
  isDark: true,
  background: '#121212', // Nền đen xám
  card: '#1E1E1E',       // Nền thẻ xám đậm
  text: '#F5F5F5',       // Chữ trắng sữa
  textMuted: '#A0A0A0',  // Chữ xám
  primary: '#E07B99',    // Hồng sáng hơn chút để nổi bật trên nền tối
  border: '#333333',     // Viền xám
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