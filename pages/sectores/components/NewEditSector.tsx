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
import * as yup from "yup";
import { Campos } from "../../../models/Campos";
import { Rubro } from "../../../models/Rubro";
import { Sector } from "../../../models/Sector";
import { Variedades } from "../../../models/Variedades";
import { GetAllVariedadesByRubro } from "../../../services/firestore/variedades";

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (values: any) => void;
  selected?: Sector | null;
  campos: Campos[];
  rubros: Rubro[];
}

const NewEditSector: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "",
  selected,
  campos,
  rubros,
}) => {
  const [variedadesList, setVariedadesList] = useState<Variedades[]>([]);
  const [campo, setCampo] = useState<any>(null);
  const [rubro, setRubro] = useState<any>(null);
  const [variedad, setVariedad] = useState<any>(null);
  const cleanVariedades = () => {
    setVariedad(null);
    setVariedadesList([]);
  };
  const formInitial = {
    Nombre: "",
    Variedad: { Nombre: "", id: "" },
    Rubro: { Nombre: "", id: "" } as any,
    Campo: { Nombre: "", id: "" },
    CampoId: "",
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
    onSubmit: (values) => onConfirm(values),
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      Campo: yup
        .object()
        .shape({
          id: yup.string().required("Campo es requerido"),
          Nombre: yup.string().required("Campo es requerido"),
        })
        .required("Campo es requerido"),
      Rubro: yup
        .object()
        .shape({
          id: yup.string().required("Rubro es requerido"),
          Nombre: yup.string().required("Rubro es requerido"),
        })
        .required("Rubro es requerido"),
      Variedad: yup
        .object()
        .shape({
          id: yup.string().required("Variedad es requerida"),
          Nombre: yup.string().required("Variedad es requerida"),
        })
        .required("Variedad es requerida"),
    }),
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selected && selected !== undefined) setValues({ ...selected } as any);
  }, [selected]);

  const getVariedadesList = async (id: string) => {
    const res = await GetAllVariedadesByRubro(id);

    if (typeof res !== "string") {
      setVariedadesList(res);
    }
  };

  useEffect(() => {
    if (selected) {
      if (selected.Campo) {
        const finded = campos.find((obj) => obj.id === selected.Campo?.id);
        if (finded) setCampo(finded);
      }
      if (selected.Rubro) {
        const finded = rubros.find((obj) => obj.id === selected.Rubro?.id);
        if (finded) {
          setRubro(finded);
          getVariedadesList(finded.id || "");
        }
      }
    }
  }, [selected]);

  useEffect(() => {
    if (selected && variedadesList.length > 0) {
      if (selected.Variedad) {
        const finded = variedadesList.find(
          (obj) => obj.id === selected.Variedad?.id
        );
        if (finded) setVariedad(finded);
      }
    }
  }, [selected, variedadesList]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{(title || "Nuevo") + " Sector"}</DialogTitle>
          <DialogContent>
            <Grid container justifyContent="space-evenly">
              <Grid item container xs={12} sm={8} spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Nombre Usuario"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="Nombre"
                        value={
                          selected &&
                          selected?.User &&
                          selected?.User.Nombre + " " + selected?.User.Apellido
                        }
                        variant="outlined"
                        autoComplete="off"
                        disabled
                        type="text"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                        // onChange={handleChange}
                        // onBlur={handleBlur}
                        // error={touched.Nombre && Boolean(errors.Nombre)}
                        // helperText={touched.Nombre && errors.Nombre}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Fecha Creación"}
                      </Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <TextField
                        id="FechaCreacion"
                        value={
                          selected?.FechaCreacion
                            ? selected?.FechaCreacion.toDate().toLocaleDateString(
                                "es-ES",
                                {
                                  weekday: "short",
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : ""
                        }
                        variant="outlined"
                        autoComplete="off"
                        disabled
                        type="text"
                        fullWidth
                        inputProps={{ maxLength: 70 }}
                      />
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Campo"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <Autocomplete
                        id="rubro-select"
                        options={campos}
                        value={campo}
                        getOptionLabel={(option: Campos) => option?.Nombre}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            setCampo(newValue);
                            setFieldValue("Campo", {
                              id: newValue.id,
                              Nombre: newValue.Nombre,
                            });
                            setFieldValue("CampoId", newValue.id);
                          } else {
                            // setFieldValue("Rubro", null);
                            // setFieldValue("CampoId", "");
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={touched.Campo && Boolean(errors.Campo)}
                            helperText={touched.Campo && errors.Campo}
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
                <Grid item xs={12} sm={6}>
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
                          if (newValue) {
                            cleanVariedades();
                            setRubro(newValue);
                            setFieldValue("Rubro", {
                              id: newValue.id,
                              Nombre: newValue.Nombre,
                            });
                            const id = newValue.id;
                            if (id) {
                              getVariedadesList(newValue.id || "");
                            }
                          } else {
                            cleanVariedades();
                            // setFieldValue("Rubro", null);
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
                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Nombre Sector"}
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
                <Grid item xs={12} sm={6}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">{"Variedad"}</Typography>
                    </Box>
                    <Box mt={1} mb={2}>
                      <Autocomplete
                        id="variedades-select"
                        options={variedadesList}
                        value={variedad}
                        getOptionLabel={(option: Variedades) => option?.Nombre}
                        onChange={(_, newValue) => {
                          if (newValue) {
                            setVariedad(newValue);
                            setFieldValue("Variedad", {
                              id: newValue.id,
                              Nombre: newValue.Nombre,
                            });
                          } else {
                            // setFieldValue("Variedad", null);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={touched.Variedad && Boolean(errors.Variedad)}
                            helperText={touched.Variedad && errors.Variedad}
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
              <Grid item container xs={12} sm={3}>
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
                  {/* <img
                    src={validateFile(values.Foto)}
                    style={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                    }}
                    alt={"UploadedImage"}
                  /> */}
                </Paper>
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

export default NewEditSector;
