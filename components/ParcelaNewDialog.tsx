import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import * as yup from "yup";
import { Condominios } from "../models/Condominios";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  condominios: Condominios[];
  onConfirm: (values: any) => void;
}

const ParcelaNewDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  condominios = [],
  title = "",
}) => {
  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    resetForm,
    setFieldValue,
  } = useFormik({
    initialValues: {
      NombreParcela: "",
      NombreCondominio: "",
      IdCondominio: "",
      NombrePropietario: "",
      idPropietario: "",
    },
    onSubmit: (values) => {
      onConfirm(values);
    },
    validationSchema: yup.object({
      NombreParcela: yup.string().required("Nombre requerido"),
      NombreCondominio: yup.string().required("Nombre requerido"),
    }),
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="sm">
        <form onSubmit={handleSubmit}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">
                      {"Nombre Parcela"}
                    </Typography>
                  </Box>
                  <Box mt={1} mb={2}>
                    <TextField
                      id="NombreParcela"
                      value={values.NombreParcela}
                      variant="outlined"
                      autoComplete="off"
                      type="text"
                      fullWidth
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.NombreParcela && Boolean(errors.NombreParcela)
                      }
                      helperText={touched.NombreParcela && errors.NombreParcela}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">
                      {"Nombre Condominio"}
                    </Typography>
                  </Box>
                  <Box mt={1} mb={2}>
                    <Autocomplete
                      id="condominio-select"
                      options={condominios}
                      autoHighlight
                      getOptionLabel={(option: Condominios) => option?.Nombre}
                      onChange={(_, newValue: any) => {
                        if (newValue) {
                          setFieldValue("NombreCondominio", newValue.Nombre);
                          setFieldValue("IdCondominio", newValue.id);
                          setFieldValue(
                            "NombrePropietario",
                            newValue.Manager.Nombre || ""
                          );
                          setFieldValue(
                            "idPropietario",
                            newValue.Manager.id || ""
                          );
                        } else {
                          setFieldValue("NombreCondominio", "");
                          setFieldValue("IdCondominio", "");
                          setFieldValue("NombrePropietario", "");
                          setFieldValue("idPropietario", "");
                        }
                      }}
                      renderOption={(props, option: Condominios) => (
                        <Box component="li" {...props}>
                          {option?.Nombre +
                            " [ " +
                            option.Manager?.Nombre +
                            " ]" || +"[]"}
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          error={
                            touched.NombreCondominio &&
                            Boolean(errors.NombreCondominio)
                          }
                          inputProps={{
                            ...params.inputProps,
                            autoComplete: "new-password", // disable autocomplete and autofill
                          }}
                        />
                      )}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
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

export default ParcelaNewDialog;
