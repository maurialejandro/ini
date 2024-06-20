import {
  Alert as MuiAlert,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
  TextField as MuiTextField,
} from "@mui/material";
import { spacing } from "@mui/system";
import { Formik } from "formik";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styled from "styled-components/macro";
import * as Yup from "yup";
import { recoverPassword } from "../../services/auth";

// import useAuth from "../../hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);

const TextField = styled(MuiTextField)(spacing);

function PasswordRecovery() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  return (
    <Formik
      initialValues={{
        email: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Debe ser un correo válido")
          .max(255)
          .required("Correo es requerido"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        let errorMsg = "";
        try {
          await recoverPassword(values.email).then((res) => {
            const response: any = res;
            if (response?.code === "auth/user-not-found") {
              setSuccess(false);
              errorMsg = "Correo ingresado no pertenece a un usuario";
              throw new Error("Correo ingresado no pertenece a un usuario");
            } else if (!response) {
              setSuccess(true);
            } else {
              setSuccess(false);
            }
          });
        } catch (error: any) {
          const message = errorMsg || error.message || "Ha ocurrido un error";
          console.log(message);
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
          {success && (
            <Alert mt={2} mb={3} severity="success">
              Se ha enviado correo de recuperación
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
            Recuperar Contraseña
          </Button>
          <Button
            fullWidth
            color="primary"
            onClick={() => router.replace("/auth/login")}
          >
            Volver al login
          </Button>
        </form>
      )}
    </Formik>
  );
}

export default PasswordRecovery;
