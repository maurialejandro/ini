import {
  Alert as MuiAlert,
  Button,
  Checkbox,
  FormControlLabel,
  TextField as MuiTextField,
} from "@mui/material";
import { spacing } from "@mui/system";
import { Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import styled from "styled-components/macro";
import * as Yup from "yup";
import { signInWithEmail } from "../../services/auth";
import { useAuth } from "../context/AuthProvider";

// import useAuth from "../../hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);

const TextField = styled(MuiTextField)(spacing);

function SignIn() {
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth.userData?.Permisos !== "Usuario" && auth.user) router.replace("/");
  }, [auth.userData]);

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Debe ser un correo válido")
          .max(255)
          .required("Correo es requerido"),
        password: Yup.string().max(255).required("Contraseña es requerida"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const error: any = await signInWithEmail(
            values.email,
            values.password
          );
          if (error) {
            if (error === "auth/user-not-found") {
              throw new Error("Credenciales no válidas");
            } else if (error === "auth/too-many-requests") {
              throw new Error("Demasiados intentos");
            } else if (error === "auth/wrong-password") {
              throw new Error("Contraseña incorrecta");
            } else if (error === "auth/wrong-email") {
              throw new Error("Usuario incorrecto");
            } else {
              throw new Error("No se ha podido acceder");
            }
          }
          // router.replace("/parcelas");
        } catch (error: any) {
          console.log(error);

          const message = error.message || "Contraseña o Email incorrecto";

          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <form noValidate onSubmit={handleSubmit}>
          {errors.submit && (
            <Alert mt={2} mb={3} severity="warning">
              {errors.submit}
            </Alert>
          )}
          <TextField
            type="email"
            name="email"
            label="Correo"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            style={{ marginTop: 8, marginBottom: 8 }}
            // my={2}
          />
          <TextField
            type="password"
            name="password"
            label="Contraseña"
            value={values.password}
            error={Boolean(touched.password && errors.password)}
            fullWidth
            helperText={touched.password && errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            style={{ marginTop: 8, marginBottom: 8 }}
            // my={2}
          />
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Recordarme"
          /> */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
          >
            Iniciar Sesión
          </Button>
          <Button
            fullWidth
            color="primary"
            onClick={() => router.replace("/auth/recovery")}
          >
            Olvidé mi contraseña
          </Button>
        </form>
      )}
    </Formik>
  );
}

export default SignIn;
