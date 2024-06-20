import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Image } from "react-feather";
import * as yup from "yup";
import { Variedades } from "../../../models/Variedades";
import { Rubro } from "../../../models/Rubro";
interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  rubros: Rubro[];
  onConfirm: (values: any) => void;
  selected?: Variedades | null;
}

const NewEditEtiquetas: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  rubros = [],
  title = "",
  selected,
}) => {
  const [rubro, setRubro] = useState<any>(null);

  const formInitial = {
    Nombre: "" as string,
    Posicion: undefined,
    Rubro: undefined as { id: string; Nombre: string } | undefined,
    Descripcion: "" as string,
    Recomendacion: "" as string,
    Rango: {
      min: 0,
      max: 0,
    },
    Foto: null as
      | {
          Url: string;
          Path: string;
        }
      | null
      | File,
    hasPhoto: false as boolean | undefined,
  };
  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    resetForm,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: formInitial,
    onSubmit: (values) => onConfirm((({ hasPhoto, ...obj }) => obj)(values)),
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      Rubro: yup
        .object()
        .shape({
          id: yup.string().required("Rubro es requerido"),
          Nombre: yup.string().required("Rubro es requerido"),
        })
        .required("Rubro es requerido"),
      Rango: yup
        .object()
        .shape({
          min: yup.number().required("Es requerido"),
          max: yup.number().required("Es requerido"),
        })
        .required("Es Requerido"),
      Descripcion: yup.string().required("Descripción es requerida"),
      Posicion: yup.number().min(0, "Inválido").required("Requerido"),
      hasPhoto: yup.boolean().isTrue(),
    }),
  });

  useEffect(() => {
    if (!open) {
      resetForm();
      setRubro(null);
    }
  }, [open]);

  const validateFile = (
    file:
      | {
          Url: string;
          Path: string;
        }
      | null
      | File
  ) => {
    let validate = "";
    if (file instanceof File) validate = URL.createObjectURL(file);
    else validate = file?.Url as string;
    return validate;
  };

  useEffect(() => {
    if (selected && selected !== undefined) {
      setValues({ ...selected, hasPhoto: true } as any);
      setRubro(rubros.find((item) => item.id === selected.Rubro.id));
    }
  }, [selected]);

  const validateNumber = (value: any) => {
    if (value === null || typeof value === "undefined") return false;
    const numValue = Number(value);
    if (typeof numValue === "undefined") return false;
    return true;
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{(title || "Nueva") + " Etiqueta"}</DialogTitle>
          <DialogContent>
            <Grid container justifyContent="space-evenly">
              <Grid item container xs={12} sm={8}>
                <Grid item xs={12} sm={6} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Nombre/Especie"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2} mr={1}>
                      <TextField
                        id="Nombre"
                        value={values.Nombre}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.Nombre && Boolean(errors.Nombre)}
                        helperText={touched.Nombre && errors.Nombre}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Rubro"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <Autocomplete
                        id="rubro-select"
                        options={rubros}
                        value={rubro}
                        getOptionLabel={(option: Rubro) => option?.Nombre}
                        onChange={(_, newValue) => {
                          setRubro(newValue);
                          if (newValue) {
                            setFieldValue("Rubro", {
                              id: newValue.id,
                              Nombre: newValue.Nombre,
                            });
                          } else {
                            setFieldValue("Rubro", null);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={touched.Rubro && Boolean(errors.Rubro)}
                            helperText={touched.Rubro && errors.Rubro}
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
                <Grid item xs={12} sm={2} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Posicion"}</Typography>
                    </Box>
                    <Box mt={1} mb={2} mr={1}>
                      <TextField
                        id="Posicion"
                        value={values.Posicion || 0}
                        variant="outlined"
                        autoComplete="off"
                        type="number"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.Posicion && Boolean(errors.Posicion)}
                        helperText={touched.Posicion && errors.Posicion}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Grados Desde"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2} mr={1}>
                      <TextField
                        id="GradosDesde"
                        value={values.Rango?.min || 0}
                        variant="outlined"
                        autoComplete="off"
                        type="number"
                        inputMode="numeric"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                        onChange={(e) =>
                          // e.target.value &&
                          // e.target.value !== undefined &&
                          validateNumber(e.target.value) &&
                          setFieldValue("Rango", {
                            ...values.Rango,
                            min: Number(e.target.value),
                          })
                        }
                        onBlur={handleBlur}
                        error={touched.Rango?.min && Boolean(errors.Rango?.min)}
                        helperText={touched.Rango?.min && errors.Rango?.min}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={5} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Grados Hasta"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="GradosHasta"
                        value={values.Rango?.max || 0}
                        variant="outlined"
                        autoComplete="off"
                        type="number"
                        inputMode="numeric"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                        onChange={(e) =>
                          // e.target.value &&
                          // e.target.value !== undefined &&
                          validateNumber(e.target.value) &&
                          setFieldValue("Rango", {
                            ...values.Rango,
                            max: Number(e.target.value),
                          })
                        }
                        onBlur={handleBlur}
                        error={touched.Rango?.max && Boolean(errors.Rango?.max)}
                        helperText={touched.Rango?.max && errors.Rango?.max}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} style={{ height: 160 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box
                      mt={1}
                      display="flex"
                      sx={{ flexDirection: "row" }}
                      justifyContent="space-between"
                    >
                      <Typography variant="caption">{"Descripción"}</Typography>
                      <Typography variant="caption">
                        {values.Descripcion.length + "/" + "300"}
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <TextField
                        id="Descripcion"
                        value={values.Descripcion}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        inputProps={{ maxLength: 300 }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.Descripcion && Boolean(errors.Descripcion)
                        }
                        helperText={touched.Descripcion && errors.Descripcion}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} style={{ height: 170 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box
                      mt={0}
                      display="flex"
                      sx={{ flexDirection: "row" }}
                      justifyContent="space-between"
                    >
                      <Typography variant="caption">
                        {"Recomendación"}
                      </Typography>
                      <Typography variant="caption">
                        {(values.Recomendacion?.length || 0) + "/" + "300"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="Recomendacion"
                        value={values.Recomendacion}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        inputProps={{ maxLength: 300 }}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={
                          touched.Recomendacion && Boolean(errors.Recomendacion)
                        }
                        helperText={
                          touched.Recomendacion && errors.Recomendacion
                        }
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Grid item container xs={12} sm={3} style={{ height: 250 }}>
                <input
                  style={{
                    display: "none",
                  }}
                  onChange={(event) => {
                    if (event.target.files) {
                      const file = event.target.files[0];
                      setFieldValue("Foto", file);
                      setFieldValue("hasPhoto", true);
                    }
                  }}
                  id="contained-button-file"
                  type="file"
                  accept="image/png, image/jpeg"
                />
                <Paper
                  variant="outlined"
                  style={{
                    height: 250,
                    width: 250,
                    borderRadius: 20,
                    overflow: "hidden",
                    marginTop: 13,
                  }}
                >
                  <label
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    htmlFor="contained-button-file"
                  >
                    {!values.Foto ? (
                      <Image />
                    ) : (
                      <img
                        src={validateFile(values.Foto)}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={"UploadedImage"}
                      />
                    )}
                  </label>
                </Paper>
                {touched.hasPhoto && Boolean(errors.hasPhoto) && (
                  <Typography variant="caption" color="red">
                    {"Se requiere de una imagen."}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button
              disabled={values.Rango.min >= values.Rango.max}
              type="submit"
            >
              Aceptar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default NewEditEtiquetas;
