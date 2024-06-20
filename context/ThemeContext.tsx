import React from "react";

import { THEMES } from "../configs/constants";

const initialState = {
  theme: THEMES.DEFAULT,
  setTheme: (theme: any) => {},
};
const ThemeContext = React.createContext(initialState);

function ThemeProvider({ children }: any) {
  
  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    _setTheme(storedTheme ? JSON.parse(storedTheme) : THEMES.DEFAULT);
  }, []);

  const [theme, _setTheme] = React.useState<any>();

  const setTheme = (theme: any) => {
    localStorage.setItem("theme", JSON.stringify(theme));
    _setTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, ThemeContext };
