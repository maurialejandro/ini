import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
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
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import Dashboard from "../../../components/layouts/Dashboard";
import { useCargos } from "../../../hooks/useCargos";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const CargoView = () => {
  return (
    <Dashboard>
      <Helmet title="Cargo" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link href="/cargos" passHref>
              <MuiLink href="/cargos">Cargos</MuiLink>
            </Link>
            <Typography>{"Crear"}</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Divider my={5} />
      <CargoForm />
    </Dashboard>
  );
};

type FormProps = {
  id?: string;
};
export const CargoForm = (props: FormProps) => {
  const { id } = props;

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
  } = useCargos({ id });

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
              <Grid item container xs={12} sm={12}>
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
                        <Typography variant="caption">{"Permisos"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={values.Campos}
                                onChange={(e) =>
                                  setValue("Campos", e.target.checked)
                                }
                              />
                            }
                            label="Campos"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={values.Muestras}
                                onChange={(e) =>
                                  setValue("Muestras", e.target.checked)
                                }
                              />
                            }
                            label="Muestras"
                          />
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={values.Resultados}
                                onChange={(e) =>
                                  setValue("Resultados", e.target.checked)
                                }
                              />
                            }
                            label="Resultados"
                          />
                        </FormGroup>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
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

export default CargoView;
