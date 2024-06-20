import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { StyledEngineProvider } from "@mui/styled-engine-sc";
import jssPreset from "@mui/styles/jssPreset";
import StylesProvider from "@mui/styles/StylesProvider";
import { create } from "jss";
import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { ThemeProvider as ThemeProviderMacro } from "styled-components/macro";
import { AuthProvider } from "../components/context/AuthProvider";
import { RubrosProvider } from "../components/context/RubrosProvider";
import { MuestrasProvider } from "../components/context/MuestrasProvider";
import { ThemeProvider } from "../context/ThemeContext";
import useTheme from "../hooks/useTheme";
import createTheme from "../theme";
import "../vendor/perfect-scrollbar.css";

function MyApp({ Component, pageProps }: AppProps) {
  const { theme } = useTheme();

  const [jss, setJss] = useState<any>();
  useEffect(() => {
    const jss = create({
      ...jssPreset(),
      insertionPoint: document.getElementById("jss-insertion-point") as any,
    });
    setJss(jss);
  }, []);

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s | Inia " defaultTitle="Inia - Admin" />
      {jss && (
        <StylesProvider jss={jss}>
          <StyledEngineProvider injectFirst>
            <MuiThemeProvider theme={createTheme(theme)}>
              <ThemeProviderMacro theme={createTheme(theme)}>
                <ThemeProvider>
                  <AuthProvider>
                    <RubrosProvider>
                      <MuestrasProvider>
                        <Component {...pageProps} />
                      </MuestrasProvider>
                    </RubrosProvider>
                  </AuthProvider>
                </ThemeProvider>
              </ThemeProviderMacro>
            </MuiThemeProvider>
          </StyledEngineProvider>
        </StylesProvider>
      )}
    </HelmetProvider>
  );
}

export default MyApp;
