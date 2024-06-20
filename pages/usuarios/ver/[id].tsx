import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
  Select,
  Alert,
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Divider as MuiDivider,
  Grid,
  Link as MuiLink,
  IconButton,
  Paper,
  InputAdornment,
  Snackbar,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import styled from "styled-components/macro";
import { User } from "firebase/auth";
import { useFormik } from "formik";
import * as rutUtils from "rut.js";
import * as yup from "yup";
import { useAuth } from "../../../components/context/AuthProvider";
import Link from "next/link";
import { spacing } from "@mui/system";
import { useRouter } from "next/router";
import { useUsers } from "../../../components/context/UsuariosProvider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SkeletonFormParcela from "../../../components/SkeletonFormParcela";
import { getOneUser } from "../../../services/firestore/users";
import { Users } from "../../../models/Users";
import { Regiones } from "../../../models/Regiones";
import { getAllRegiones } from "../../../services/firestore/regiones";
import { getComunas } from "../../../services/firestore/regiones";
import { openSnack } from "../../../services/firestore/snackbar";
import Dashboard from "../../../components/layouts/Dashboard";
import { Helmet } from "react-helmet-async";
import { useFirebaseData } from "../../../hooks/useFirebaseData";
import { updateUser } from "../../../services/firestore/users";
import { useCargosList } from "../../../hooks/useCargosList";
import { Cargo } from "../../../models/Cargo";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const UsuarioView = () => {
  const router = useRouter();
  const { userData: userDB, user } = useAuth();
  const [usuario, setUsuario] = useState<Users>();
  const { id } = router.query;
  const utilUser = useUsers();
  const selectedUser = utilUser.user;
  const childCompRef = useRef<RefCompHandle>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (childCompRef.current) {
      childCompRef.current.doSomething();
    }
  }, []);

  useEffect(() => {
    if (id && selectedUser === undefined) {
      const fetchData = async () => {
        setUsuario(await getOneUser(String(id)));
      };
      fetchData().catch(console.error);
    } else if (selectedUser) {
      setUsuario(selectedUser);
    }
  }, [id]);

  const handleSubmit = async (dataUser: any) => {
    const emailForm = dataUser?.Email;
    const emailAuth = usuario?.Email;
    if (id) {
      const resUpdt = await updateUser(Object(dataUser), emailForm, emailAuth);

      if (resUpdt === "email-coincide") {
        setSnackState(openSnack("warning", "¡Email ya esta en uso!"));
      } else if (resUpdt === "OK") {
        setSnackState(openSnack("success", "¡Actualizado con éxito!"));
        router.replace("/usuarios");
      } else if ("no-validate") {
        setSnackState(
          openSnack("warning", "¡Ha ocurrido un problema al Actualizar!")
        );
      }
    }
  };

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  return (
    <Dashboard>
      <Helmet title="Usuario" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link href="/usuarios" passHref>
              <MuiLink href="/usuarios">Usuarios</MuiLink>
            </Link>
            <Typography>Editar</Typography>
          </Breadcrumbs>
          <Typography variant="h3" gutterBottom>
            Usuario {usuario?.Nombre}
          </Typography>
        </Grid>
      </Grid>
      <Divider my={3} />
      <Grid container spacing={12}>
        <Grid item sm={12}>
          <Box display="flex" justifyContent="flex-end">
            <IconButton
              aria-label="dalete"
              size="large"
              onClick={() => {
                router.replace("/usuarios");
              }}
            >
              <ArrowBackIcon></ArrowBackIcon>
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Divider my={3} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <DataUser Usuario={usuario} userAuth={user} onSubmit={handleSubmit} />
        </Grid>
      </Grid>
      <Snackbar
        sx={{ width: 390, height: 540 }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackState.open}
        autoHideDuration={3000}
        onClose={handleCloseSnack}
      >
        <Alert
          onClose={handleCloseSnack}
          severity={snackState.severity}
          sx={{ widh: "100%" }}
        >
          {snackState.message}
        </Alert>
      </Snackbar>
    </Dashboard>
  );
};

export type RefCompHandle = {
  doSomething: () => void;
};

interface DataViewProps {
  Usuario?: any;
  onSubmit: (data: Users) => void;
  userAuth: User | null | undefined;
}

const DataUser = forwardRef((props: DataViewProps, ref) => {
  const { Usuario, userAuth, onSubmit, ...other } = props;
  const [regiones, setRegiones] = useState<Regiones | any | null | "">();
  const [comunas, setComunas] = useState<any | null | "">();
  const [regionSelect, setRegionSelect] = useState("");
  const [comunaSelect, setComunaSelect] = useState("");
  const [regionId, setRegionId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!regiones) {
      const fetchData = async () => {
        setRegiones(await getAllRegiones());
      };
      fetchData().catch(console.error);
    }
  });

  const handleGetIdRegion = (id: string) => {
    setComunas("");
    setComunaSelect("");

    if (id) {
      setRegionId(id);
      const fetchData = async () => {
        setComunas(await getComunas(String(id)));
      };
      fetchData().catch(console.error);
    }
  };

  const handleChangeRegion = (name: any, id: any) => {
    handleGetIdRegion(id);
    setRegionSelect(name);
  };

  const handleChangeComuna = (name: any, id: any) => {
    setComunaId(id);
    setComunaSelect(name);
  };

  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    setValues,
    setFieldValue,
  } = useFormik({
    initialValues: {
      Nombre: "",
      Apellido: "",
      Email: "",
      Password: "",
      PasswordRe: "",
      Rut: "",
      Telefono: 9,
      Cargo: null as any,
    },
    onSubmit: (values) => {
      const dataUser: any = {
        uid: userAuth?.uid,
        id,
       
        Nombre: values.Nombre,
        Apellido: values.Apellido,
        Rut: values.Rut,
        Email: values.Email,
        Password: values.Password,
        Telefono: values.Telefono,
        Comuna: {
          id: comunaId,
          Nombre: comunaSelect,
        },
        Region: {
          id: regionId,
          Nombre: regionSelect,
        },
      };
      if(values.Cargo) dataUser['Cargo'] = values.Cargo;
      onSubmit(dataUser);
    },

    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      Apellido: yup.string().required("Apellido requerido"),
      Rut: yup
        .string()
        .min(11)
        .required("Rut requerido")
        .test({
          name: "Rut",
          message: "Rut no valido",
          test: (value) => {
            if (!value) return false;
            return rutUtils.validate(value);
          },
        }),
      Telefono: yup
        .number()
        .min(900000000, "Número no válido")
        .max(999999999, "Número no válido")
        .required("Telefono Requerido"),
      Email: yup.string().email("Email no válido").required("Email requerido"),
      // Password: yup
      //   .string()
      //   .max(255, "Contraseña muy larga")
      //   .min(6, "Contraseña muy corta")
      //   .required("Contraseña requerida"),
      // PasswordRe: yup
      //   .string()
      //   .required("Repetir contraseña requerido")
      //   .oneOf([yup.ref("Password"), null], "Contraseñas no coinciden"),
    }),
  });

  useEffect(() => {
    if (Usuario?.Nombre !== undefined) {
      setValues({
        Nombre: Usuario?.Nombre,
        Apellido: Usuario?.Apellido,
        Telefono: Usuario?.Telefono,
        Rut: Usuario?.Rut,
        Password: Usuario?.Password,
        PasswordRe: "",
        Email: Usuario?.Email,
        Cargo: Usuario?.Cargo ? Usuario?.Cargo : null,
      });
      setRegionSelect(Usuario.Region.Nombre);
      handleGetIdRegion(Usuario.Region.id);
      setComunaSelect(Usuario.Comuna.Nombre);
    }
  }, [Usuario]);

  const { loadExportData } = useCargosList({ filtro: null });
  const [cargos, setCargos] = useState<Cargo[]>([]);

  useEffect(() => {
    const onLoad = async () => {
      const res = await loadExportData();
      setCargos(res);
    };
    onLoad();
  }, []);

  return (
    <>
      <Paper
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Card>
          <CardContent>
            {Usuario ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={12}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={12} mb={1}>
                        <Typography variant="subtitle1">
                          {"Datos Usuario"}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">
                          {"Nombre Usuario"}
                        </Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Nombre"
                          value={values?.Nombre}
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

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Telefono"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Telefono"
                          value={values?.Telefono}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                +56
                              </InputAdornment>
                            ),
                          }}
                          error={touched.Telefono && Boolean(errors.Telefono)}
                          helperText={touched.Telefono && errors.Telefono}
                        />
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={7} mb={2} mr={2}>
                        <FormControl fullWidth>
                          <InputLabel id="regionLabel"> Región </InputLabel>
                          <Select
                            required
                            labelId="dateSalect"
                            id="region"
                            value={regionSelect}
                            label="regionLabel"
                            onChange={(SelectedOption, child: any) => {
                              handleChangeRegion(
                                SelectedOption.target.value,
                                child?.props?.id
                              );
                              handleChange;
                            }}
                          >
                            {regiones ? (
                              regiones.map((row: any) => (
                                <MenuItem
                                  key={row?.Nombre}
                                  id={row?.id}
                                  value={row?.Nombre}
                                >
                                  {row?.Nombre}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value={1}>Error data</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Correo"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Email"
                          value={values?.Email}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Email && Boolean(errors.Email)}
                          helperText={touched.Email && errors.Email}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Apellido"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Apellido"
                          value={values?.Apellido}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Apellido && Boolean(errors.Apellido)}
                          helperText={touched.Apellido && errors.Apellido}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={7} mb={2} mr={2}>
                        <FormControl fullWidth>
                          <InputLabel id="comunaLabel"> Comuna </InputLabel>
                          <Select
                            required
                            labelId="comunaSalect"
                            id="comuna"
                            value={comunaSelect}
                            label="comunaLabel"
                            onChange={(SelectedOption, child: any) => {
                              handleChangeComuna(
                                SelectedOption.target.value,
                                child?.props?.id
                              );
                              handleChange;
                            }}
                          >
                            {comunas ? (
                              comunas.map((comuna: any) => (
                                <MenuItem
                                  key={comuna?.Nombre}
                                  id={comuna?.id}
                                  value={comuna?.Nombre}
                                >
                                  {comuna?.Nombre}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem value={1}>Seleccione región</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Grid>
                  {/* <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">
                          {"Contraseña"}
                        </Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Password"
                          value={values?.Password}
                          variant="outlined"
                          autoComplete="off"
                          type="password"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Password && Boolean(errors.Password)}
                          helperText={touched.Password && errors.Password}
                        />
                      </Box>
                    </Box>
                  </Grid> */}
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Rut"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="Rut"
                          value={values?.Rut}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.Rut && Boolean(errors.Rut)}
                          helperText={touched.Rut && errors.Rut}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  {/* <Grid item xs={12} sm={4}></Grid> */}
                  {/* <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">
                          {"Repetir contraseña"}
                        </Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <TextField
                          id="PasswordRe"
                          variant="outlined"
                          value={values.PasswordRe}
                          autoComplete="off"
                          type="password"
                          fullWidth
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.PasswordRe && Boolean(errors.PasswordRe)
                          }
                          helperText={touched.PasswordRe && errors.PasswordRe}
                        />
                      </Box>
                    </Box>
                  </Grid> */}

                  <Grid item xs={12} sm={4}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">{"Cargo"}</Typography>
                      </Box>
                      <Box mt={1} mb={2} mr={2}>
                        <Autocomplete
                          id="cargos-select"
                          options={cargos}
                          value={values.Cargo}
                          getOptionLabel={(o) => o?.Nombre}
                          onChange={(_, c) => c && setFieldValue("Cargo", c)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              inputProps={{
                                ...params.inputProps,
                                autoComplete: "new-password", // disable autocomplete and autofill
                              }}
                              //   error={touched.Comuna && Boolean(errors.Comuna)}
                              //   helperText={
                              //     touched.Comuna && errors.Comuna?.Nombre
                              //   }
                            />
                          )}
                          // onBlur={handleBlur}

                          //   disabled={loading}
                        />
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={4} mt={5}>
                  <Button variant="contained" type="submit">
                    Guardar
                  </Button>
                </Grid>
              </form>
            ) : (
              <SkeletonFormParcela />
            )}
          </CardContent>
        </Card>
      </Paper>
    </>
  );
});
export default UsuarioView;
