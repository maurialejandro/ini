import {
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
import React, { useEffect } from "react";
import { Image } from "react-feather";
import * as yup from "yup";
import { Rubro } from "../../../models/Rubro";

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (values: any) => void;
  selected?: Rubro | null;
}

const NewEditRubro: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "",
  selected,
}) => {
  const formInitial = {
    Nombre: "" as string,
    Descripcion: "" as string,
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
      Descripcion: yup.string().required("Descripción es requerida"),
      hasPhoto: yup.boolean().isTrue(),
    }),
  });

  useEffect(() => {
    if (!open) {
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
    if (selected && selected !== undefined)
      setValues({ ...selected, hasPhoto: true } as any);
  }, [selected]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{(title || "Nuevo") + " Rubro"}</DialogTitle>
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
            <Button type="submit">Aceptar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default NewEditRubro;
