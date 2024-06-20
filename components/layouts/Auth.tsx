import React, { FC } from "react";
import styled from "styled-components/macro";

import { CssBaseline } from "@mui/material";

import Settings from "../Settings";
import GlobalStyle from "../GlobalStyles";

const Root = styled.div`
  max-width: 520px;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  height: 100vh;
`;

const Auth: FC = ({ children }) => {
  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      {children}
      {/* <Settings /> */}
    </Root>
  );
};

export default Auth;
