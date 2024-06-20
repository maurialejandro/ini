import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Link as MuiLink,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import Link from "next/link";
import { Image } from "react-feather";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import Dashboard from "../../../components/layouts/Dashboard";
import { useLocations } from "../../../hooks/useLocations";
import { useProveedores } from "../../../hooks/useProveedores";
import { Regiones } from "../../../models/Regiones";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const ProveedorView = () => {
  return (
    <Dashboard>
      <Helmet title="Proveedor" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link href="/proveedores" passHref>
              <MuiLink href="/proveedores">Proveedores</MuiLink>
            </Link>
            <Typography>{"Crear"}</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Divider my={5} />
      <ProveedorForm />
    </Dashboard>
  );
};

type FormProps = {
  id?: string;
};
export const ProveedorForm = (props: FormProps) => {
  const { id } = props;

  const { regiones, comunas, loadComunas } = useLocations({});

  const {
    values,
    errors,
    touched,
    handleBlur,
    setValue,
    handleSubmit,
    loading,
    snackState,
    handleCloseSnack,
  } = useProveedores({ id });

  const changeRegion = (r: Regiones) => {
    loadComunas(r.id);
    setValue("Comuna", null);
    setValue("Region", r);
  };

  return (
    <Paper
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={1}>
              <Grid item container xs={12} sm={8}>
                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Nombre"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Nombre"
                          value={values.Nombre}
                          onChange={(e) => setValue("Nombre", e.target.value)}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          error={touched.Nombre && Boolean(errors.Nombre)}
                          helperText={touched.Nombre && errors.Nombre}
                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Dirección"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Direccion"
                          value={values.Direccion}
                          onChange={(e) =>
                            setValue("Direccion", e.target.value)
                          }
                          type="text"
                          fullWidth
                          onBlur={handleBlur}
                          error={touched.Direccion && Boolean(errors.Direccion)}
                          helperText={touched.Direccion && errors.Direccion}
                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Región"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <Autocomplete
                          id="region-select"
                          options={regiones}
                          value={values.Region}
                          getOptionLabel={(option: any) => option?.Nombre}
                          onChange={(_, r) => r && changeRegion(r)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password", // disable autocomplete and autofill
                              }}
                              error={touched.Region && Boolean(errors.Region)}
                              helperText={
                                touched.Region && errors.Region?.Nombre
                              }
                            />
                          )}
                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Comuna"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <Autocomplete
                          id="comuna-select"
                          options={comunas}
                          value={values.Comuna}
                          getOptionLabel={(o) => o?.Nombre}
                          onChange={(_, c) => c && setValue("Comuna", c)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password", // disable autocomplete and autofill
                              }}
                              error={touched.Comuna && Boolean(errors.Comuna)}
                              helperText={
                                touched.Comuna && errors.Comuna?.Nombre
                              }
                            />
                          )}
                          // onBlur={handleBlur}

                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Email"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Email"
                          value={values.Email}
                          onChange={(e) => setValue("Email", e.target.value)}
                          variant="outlined"
                          autoComplete="off"
                          type="email"
                          fullWidth
                          onBlur={handleBlur}
                          error={touched.Email && Boolean(errors.Email)}
                          helperText={touched.Email && errors.Email}
                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Web"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Web"
                          value={values.Web}
                          onChange={(e) => setValue("Web", e.target.value)}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          onBlur={handleBlur}
                          error={touched.Web && Boolean(errors.Web)}
                          helperText={touched.Web && errors.Web}
                          disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1} mb={2} mr={2}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Teléfono"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Telefono"
                          value={values.Telefono}
                          onChange={(e) => setValue("Telefono", e.target.value)}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          inputProps={{ maxLength: 9 }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                +56
                              </InputAdornment>
                            ),
                          }}
                          fullWidth
                          disabled={loading}
                          onBlur={handleBlur}
                          error={touched.Telefono && Boolean(errors.Telefono)}
                          helperText={touched.Telefono && errors.Telefono}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                sm={4}
                justifyContent="center"
                alignContent="flex-start"
              >
                <input
                  style={{
                    display: "none",
                  }}
                  onChange={(event) => {
                    if (event.target.files) {
                      const file = event.target.files[0];
                      const imagen = {
                        file,
                        url: "x",
                        name: "logo",
                        path: "",
                      };
                      setValue("Imagen", imagen);
                    }
                  }}
                  id="contained-button-file"
                  type="file"
                  accept="image/png, image/jpeg"
                  disabled={loading}
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
                    {values.Imagen ? (
                      <img
                        src={
                          values.Imagen.file
                            ? URL.createObjectURL(values.Imagen.file)
                            : values.Imagen.url
                        }
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={"UploadedImage"}
                      />
                    ) : (
                      <Image />
                    )}
                  </label>
                </Paper>
                {Boolean(errors.Imagen?.url) && (
                  <Typography variant="caption" color="red">
                    {"Se requiere de una imagen."}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={12}>
                <Box display="flex" justifyContent="flex-start" mt={5} mr={5}>
                  <Button variant="contained" type="submit" disabled={loading}>
                    Guardar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        sx={{ width: 390, height: 340 }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackState.open}
        autoHideDuration={4000}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snackState.severity}
          sx={{ width: "100%" }}
        >
          {snackState.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProveedorView;
