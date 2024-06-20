import { Avatar, Paper, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import RecoveryComponent from "../../../components/auth/PasswordRecovery";
import { useAuth } from "../../../components/context/AuthProvider";
import AuthLayout from "../../../components/layouts/Auth";
import LoadingScreen from "../../../components/LoadingScreen";
import { Status } from "../../../models/Status";
import Image from "next/image";
// const Brand = styled(Logo)`
//   fill: ${(props) => props.theme.palette.primary.main};
//   width: 64px;
//   height: 64px;
//   margin-bottom: 32px;
// `;

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)};

  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(10)};
  }
`;

const BigAvatar = styled(Avatar)`
  width: 92px;
  height: 92px;
  text-align: center;
  margin: 0 auto ${(props) => props.theme.spacing(5)};
`;

function Login() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      router.replace("/parcelas");
    }
  }, [auth.user]);

  if (auth.authStatus !== Status.Success || auth.user) {
    return <LoadingScreen />;
  }

  return (
    <AuthLayout>
      <Wrapper>
        <Helmet title="Sign In" />
        <div
          style={{
            marginLeft: 60,
          }}
        >
           <Image 
            src={require('../../../assets/SVG/icono.svg')}
          /> 
        </div>
        <Typography component="h2" variant="body1" align="center">
          Ingresa correo para recuperar contraseña
        </Typography>

        <RecoveryComponent />
      </Wrapper>
    </AuthLayout>
  );
}

export default Login;
