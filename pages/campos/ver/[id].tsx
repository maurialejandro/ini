import {
  Alert,
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Card,
  CardContent,
  Divider as MuiDivider,
  Grid,
  Link as MuiLink,
  Paper,
  Snackbar,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { spacing } from "@mui/system";
import { User } from "firebase/auth";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import * as yup from "yup";
import { useAuth } from "../../../components/context/AuthProvider";
import Dashboard from "../../../components/layouts/Dashboard";
import SkeletonFormParcela from "../../../components/SkeletonFormParcela";
import { useCampos } from "../../../components/context/CamposProvider";
import { Campos } from "../../../models/Campos";
import { 
  getOneCampo,
  updateCampo
} from "../../../services/firestore/campos";
import { Regiones } from '../../../models/Regiones';
import { getAllRegiones } from '../../../services/firestore/regiones';
import { getComunas } from '../../../services/firestore/regiones';
import { openSnack } from "../../../services/firestore/snackbar";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const CampoView = () => {
  const router = useRouter();
  const { userData: userBD, user } = useAuth();
  const { id } = router.query;
  const utilCampo = useCampos();
  const selectedCampo = utilCampo.campo;
  const [ campo, setCampo ] = useState<Campos>();
  const childCompRef = useRef<RefCompHandle>();
  const [loading, setLoading] = useState(false);

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "¡Actualizado!",
  });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  useEffect(() => {
    if (childCompRef.current) {
      childCompRef.current.doSomething();
    }
    getData()

  }, []);

  const getData = () => {
    if ((id)) {
      const fetchData = async () => {
        setCampo(await getOneCampo(String(id)));
      };
      fetchData().catch(console.error);
    } else if (selectedCampo) {
      setCampo(selectedCampo);
    }
  }

  const handleSubmit = async (data: any) => {
   
    if(data){
      const resUpdt = await updateCampo(Object(data));
      if( resUpdt === "OK" ){
        setSnackState(openSnack("success", "¡Actualizado con éxito!"));
      } else {
        setSnackState(openSnack("warning", "¡Ha ocurrido un problema al Actualizar!"));
      }
    }
    getData();
  }

  return (
    <Dashboard>
      <Helmet title="Campos" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link href="/campos" passHref>
              <MuiLink href="/campos">Campos</MuiLink>
            </Link>
            <Typography>Editar</Typography>
          </Breadcrumbs>
          <Typography variant="h3" gutterBottom>
            Campo { campo?.Nombre }
          </Typography>
        </Grid>
      </Grid>
      <Divider my={5} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <DataCampo
            Campo={!loading && campo ? campo : undefined}
            userAuth={user}
            onSubmit={handleSubmit}
          />
        </Grid>
      </Grid>
      <Snackbar
        sx={{width: 390, height: 340}}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
    </Dashboard>
  );
};

export type RefCompHandle = {
  doSomething: () => void;
};

interface DataViewProps {
  Campo?: Campos;
  onSubmit: (data: User) => void;
  userAuth: User | null | undefined;
}

const DataCampo = forwardRef((props: DataViewProps, ref) => {

  const { Campo, userAuth, onSubmit, ...other } = props;
  const [ regiones, setRegiones ] = useState<Regiones | any | null | "" | undefined >();
  const [ comunas, setComunas ] = useState<any | null | "" | undefined >();
  const [ regionSelect, setRegionSelect ]  = useState("");
  const [ comunaSelect, setComunaSelect ] = useState("");
  const [ regionId, setRegionId ] = useState("");
  const [ comunaId, setComunaId ] = useState("");
  const user = userAuth;
  const router = useRouter();
  const { id } = router.query;

  const {
    values,
    handleSubmit,
    handleChange,
    errors,
    touched,
    handleBlur,
    setValues,
  } = useFormik({
    initialValues: {
      Nombre: "",
      Direccion: ""
    },
    onSubmit: (values) => {
      const dataCampo: any = {
        id,
        Nombre: values.Nombre,
        Direccion: values.Direccion,
        Comuna: {
          id: comunaId,
          Nombre: comunaSelect,
        },
        Region: {
          id: regionId,
          Nombre: regionSelect,
        },
        idUsuario: user?.uid
    }
    onSubmit(dataCampo);
    },
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      Direccion: yup.string().required("Dirección requerido"),
    }),
  });

  useEffect(() => {
    
    if (Campo?.Nombre !== undefined) {
      setValues({
        Nombre: Campo.Nombre,
        Direccion: Campo.Direccion
      });
      setRegionSelect(Campo.Region.Nombre)
      handleGetIdRegion(Campo.Region.id)
      setComunaSelect(Campo.Comuna.Nombre)
    }
  }, [Campo]);

  useEffect(() => {
    if(!regiones){
      const fetchData = async () => {
          setRegiones(await getAllRegiones());       
      }
      fetchData().catch(console.error);
    }
  },[regiones]);

  const handleGetIdRegion = (id: string) => {
    setComunas("");
    setComunaSelect("");
    
    if(id){
      setRegionId(id);
      const fetchData = async () => {
        setComunas(await getComunas(String(id)));
      }
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
            {Campo ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={2} mb={1}>
                        <Typography variant="subtitle1">
                          {"Usuario"}
                        </Typography>
                      </Box>
                      <Box mt={2} >
                        { Campo?.User }
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={2} mb={1}>
                        <Typography variant="subtitle1">
                          {"Creación"}
                        </Typography>
                      </Box>
                      <Box>
                        22-22-2222
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <Box display="flex" sx={{ flexDirection: "column" }} >
                      <Box mt={1} mb={2} mr={2} >
                        <Box mt={1}>
                          <Typography variant="caption">
                            {"Nombre campo"}
                          </Typography>
                        </Box>
                        <Box mt={1} mb={2} mr={2} >
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
                    </Box>              
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <Box display="flex" sx={{ flexDirection: "column" }} >
                      <Box mt={9} mb={2} mr={2} >
                        <Button variant="contained" >Ver sectores</Button>
                      </Box> 
                    </Box>              
                  </Grid>
                  <Grid item xs={12} sm={6} >
                    <Box display="flex-start" sx={{ flexDirection: "column" }} >
                      <Box mt={1} mb={2} mr={2} >
                        <Box mt={1}>
                          <Typography variant="caption">
                            {"Dirección"}
                          </Typography>
                        </Box>
                        <Box mt={1} mb={2} mr={2} >
                          <TextField 
                            id="Direccion"
                            value={values?.Direccion}
                            variant="outlined"
                            autoComplete="off"
                            type="text"
                            fullWidth
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.Direccion && Boolean(errors.Direccion)}
                            helperText={touched.Direccion && errors.Direccion}
                          />
                        </Box>
                      </Box> 
                    </Box>              
                  </Grid>
                  <Grid item xs={12} sm={6} ></Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={7} mb={2} mr={2} >
                        <FormControl fullWidth>
                          <InputLabel id="regionLabel" > Región </InputLabel>
                          <Select
                            required
                            labelId="dateSalect"
                            id="region"
                            value={regionSelect}
                            label="regionLabel"
                            onChange= { (SelectedOption, child: any) => {
                              handleChangeRegion(SelectedOption.target.value, child?.props?.id);
                              handleChange;
                            }}
                          >
                          { regiones ? (
                              regiones.map((row: any) => (
                                  <MenuItem key={row?.Nombre} id={row?.id} value={row?.Nombre} >
                                      { row?.Nombre } 
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
                  <Grid item xs={12} sm={6} ></Grid>
                  <Grid  item xs={12} sm={6}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={7} mb={2} mr={2} >
                        <FormControl fullWidth>
                          <InputLabel id="comunaLabel" > Comuna </InputLabel>
                          <Select
                            required
                            labelId="comunaSelect"
                            id="comuna"
                            value={comunaSelect}
                            label="comunaLabel"
                            onChange= { (SelectedOption, child: any) => {
                                handleChangeComuna(SelectedOption.target.value, child?.props?.id);
                                handleChange;
                            }}
                          >
                               { comunas ? (
                              comunas.map((comuna: any) => (
                                  <MenuItem key={comuna?.Nombre} id={comuna?.id} value={comuna?.Nombre}> 
                                      { comuna?.Nombre }
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
                  <Grid item xs={12} sm={12}>
                    <Box display="flex" justifyContent="flex-start" mt={5} mr={5}>
                      <Button variant="contained" type="submit">
                        Guardar
                      </Button>
                    </Box>
                  </Grid>
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

export default CampoView;
