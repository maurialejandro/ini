import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import * as yup from "yup";
import SkeletonFormParcela from "./SkeletonFormParcela";

interface Props {
  loading: boolean;
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: (values: any) => void;
  selected?: any;
}

const CondominioEditNewDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "",
  selected,
  loading,
}) => {
  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: {
      Nombre: "",
      NombreUsuario: "",
      ApellidoUsuario: "",
      EmailUsuario: "",
      PasswordUsuario: "",
    },
    onSubmit: (values) => {
      onConfirm(values);
    },
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      NombreUsuario: yup.string().required("Nombre requerido"),
      ApellidoUsuario: yup.string().required("Apellido requerido"),
      EmailUsuario: yup
        .string()
        .email("Email no válido")
        .required("Email requerido"),
      PasswordUsuario: yup
        .string()
        .max(255, "Contraseña muy larga")
        .min(6, "Contraseña muy corta")
        .required("Contraseña requerida"),
    }),
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selected) {
      setValues(selected);
    }
  }, [selected]);

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            {!loading ? (
              <Grid container spacing={1}>
                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Nombre"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="Nombre"
                        value={values.Nombre}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.Nombre && Boolean(errors.Nombre)}
                        helperText={touched.Nombre && errors.Nombre}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={2} mb={1}>
                      <Typography variant="subtitle1">
                        {"Datos Manager"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Nombre"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="NombreUsuario"
                        value={values.NombreUsuario}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.NombreUsuario && Boolean(errors.NombreUsuario)
                        }
                        helperText={
                          touched.NombreUsuario && errors.NombreUsuario
                        }
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Apellido"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="ApellidoUsuario"
                        value={values.ApellidoUsuario}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.ApellidoUsuario &&
                          Boolean(errors.ApellidoUsuario)
                        }
                        helperText={
                          touched.ApellidoUsuario && errors.ApellidoUsuario
                        }
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Email"}</Typography>
                    </Box>
                    <Box mt={1} mb={2} mr={2}>
                      <TextField
                        id="EmailUsuario"
                        value={values.EmailUsuario}
                        variant="outlined"
                        autoComplete="off"
                        type="email"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.EmailUsuario && Boolean(errors.EmailUsuario)
                        }
                        helperText={touched.EmailUsuario && errors.EmailUsuario}
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Contraseña"}</Typography>
                    </Box>
                    <Box mt={1} mb={2} mr={2}>
                      <TextField
                        id="PasswordUsuario"
                        value={values.PasswordUsuario}
                        variant="outlined"
                        autoComplete="off"
                        type="password"
                        fullWidth
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.PasswordUsuario &&
                          Boolean(errors.PasswordUsuario)
                        }
                        helperText={
                          touched.PasswordUsuario && errors.PasswordUsuario
                        }
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <SkeletonFormParcela />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit">Aceptar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default CondominioEditNewDialog;
