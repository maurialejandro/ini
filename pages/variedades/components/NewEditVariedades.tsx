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
import { number } from "yup/lib/locale";
interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  rubros: Rubro[];
  onConfirm: (values: any) => void;
  selected?: Variedades | null;
}

const NewEditVariedad: React.FC<Props> = ({
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
    Rubro: undefined as { id: string; Nombre: string } | undefined,
    Descripcion: "" as string,
    Foto: null as
      | {
          Url: string;
          Path: string;
        }
      | null
      | File,
    hasPhoto: false as boolean | undefined,
    Coef1: 0,
    Coef2: 0,
    Coef3: 0,
    Coef4: 0,
    Coef5: 0,
    Coef6: 0,
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
      Descripcion: yup.string().required("Descripción es requerida"),
      hasPhoto: yup.boolean().isTrue(),
      Coef1: yup.number().required("Es requerido"),
      Coef2: yup.number().required("Es requerido"),
      Coef3: yup.number().required("Es requerido"),
      Coef4: yup.number().required("Es requerido"),
      Coef5: yup.number().required("Es requerido"),
      Coef6: yup.number().required("Es requerido"),
    }),
  });

  useEffect(() => {
    if (!open) {
      setRubro(null);
      resetForm();
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

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{(title || "Nueva") + " Variedad"}</DialogTitle>
          <DialogContent>
            <Grid container justifyContent="space-evenly">
              <Grid item container xs={12} sm={8}>
                <Grid item xs={12} sm={12} style={{ height: 100 }}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Nombre/Especie"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2}>
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
                <Grid item xs={12} sm={12} style={{ height: 100 }}>
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

                <Grid
                  item
                  xs={12}
                  sm={12}
                  container
                  style={{ height: 90 }}
                  justifyContent="space-between"
                >
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 1"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef1"
                          value={values.Coef1}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef1 && Boolean(errors.Coef1)}
                          helperText={touched.Coef1 && errors.Coef1}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 2"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef2"
                          value={values.Coef2}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef2 && Boolean(errors.Coef2)}
                          helperText={touched.Coef2 && errors.Coef2}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 3"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef3"
                          value={values.Coef3}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef3 && Boolean(errors.Coef3)}
                          helperText={touched.Coef3 && errors.Coef3}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={12}
                  container
                  style={{ height: 90 }}
                  justifyContent="space-between"
                >
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 4"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef4"
                          value={values.Coef4}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef4 && Boolean(errors.Coef4)}
                          helperText={touched.Coef4 && errors.Coef4}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 5"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef5"
                          value={values.Coef5}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef5 && Boolean(errors.Coef5)}
                          helperText={touched.Coef5 && errors.Coef5}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={3} sm={3}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Coef 6"}</Typography>
                      </Box>
                      <Box mt={1} mb={2}>
                        <TextField
                          id="Coef6"
                          value={values.Coef6}
                          variant="outlined"
                          autoComplete="off"
                          type="number"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Coef6 && Boolean(errors.Coef6)}
                          helperText={touched.Coef6 && errors.Coef6}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Grid item xs={12} sm={12} style={{ height: 170 }}>
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
                    <Box mt={1} mb={2}>
                      <TextField
                        id="Descripcion"
                        value={values.Descripcion}
                        variant="outlined"
                        autoComplete="off"
                        type="text"
                        fullWidth
                        multiline
                        rows={5}
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
              </Grid>
              <Grid item container xs={12} sm={3}>
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
            <Button type="submit" disabled={rubro === null}>
              Aceptar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default NewEditVariedad;
