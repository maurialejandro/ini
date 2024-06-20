import {
  Autocomplete,
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Divider as MuiDivider,
  Grid,
  Link as MuiLink,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { spacing } from "@mui/system";
import { forwardRef, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
// import Dashboard from "../../components/layouts/Dashboard";
import { withStyles } from "@mui/styles";
import { useFormik } from "formik";
import * as yup from "yup";
// import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
// import { newUseTable } from "../../hooks/newUseTable";

import { Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMuestra } from "../../../components/context/MuestrasProvider";
import Dashboard from "../../../components/layouts/Dashboard";
import SampleChart from "../components/Chart";
import { Muestra } from "../../../models/Muestra";
import { GetRangeEtiquetas } from "../../../services/firestore/etiquetas";
import { UpdateMuestra } from "../../../services/firestore/muestras";
import {
  AddSectorMuestras,
  GetSectorMuestras,
} from "../../../services/firestore/sectores";
import { Etiquetas } from "../../../models/Etiquetas";

const Divider = styled(MuiDivider)(spacing);

const CssTextField = withStyles({
  root: {
    "& input": {
      color: "#fff",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#fff",
      },
      "&:hover fieldset": {
        borderColor: "#fff",
      },
    },
  },
})(TextField);

const MuestraView = () => {
  const router = useRouter();
  //   const rubro = useRubro();
  //   const childCompRef = useRef<RefCompHandle>();
  //   const [rubros, setRubros] = useState<Rubro[]>([]);
  const { id } = router.query;

  return (
    <Dashboard>
      <Helmet title="Muestras" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Muestra
          </Typography>
        </Grid>
        <Grid item></Grid>
      </Grid>
      <Grid style={{ marginBottom: 15 }}>
        <Breadcrumbs>
          <Link href="/muestras">
            <MuiLink href="/muestras">Muestra</MuiLink>
          </Link>

          <Typography>Detalle</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <DataMuestra />
        </Grid>
      </Grid>
    </Dashboard>
  );
};

interface DataViewProps {
  Usuario?: any;
}

const DataMuestra = forwardRef((props: DataViewProps, ref) => {
  const { Usuario, ...other } = props;
  const router = useRouter();
  const useMuestras = useMuestra();
  const { id } = router.query;
  const [calculatedEtiqueta, setCalculatedEtiqueta] =
    useState<Etiquetas | null>(null);

  const [outRange, setOutRange] = useState(false);

  const [muestrasCalculadas, setMuestrasCalculadas] = useState<any[]>([]);
  const [muestrasEstimadas, setMuestrasEstimadas] = useState<any[]>([]);
  const [chartCategories, setChartCategories] = useState<any[]>([]);

  // const [etiquetaFormula, setEtiquetaFormula] = useState<any>({});

  const [rubro, setRubro] = useState<any>(null);
  const formInitial = {
    FotoPath: "",
    FotoUrl: "",
    CalculoFormula: "",
    Campo: { Nombre: "", Id: "" },
    Sector: { Nombre: "", Id: "" },
    Etiqueta: {} as any,
    FechaCreacion: Timestamp.now(),
    User: { Nombre: "", Id: "", Apellido: "" },
    Ubicacion: { lat: 0, lng: 0 },
    EtiquetaFormulaInvalida: false,
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
    onSubmit: (values) => {},
    validationSchema: yup.object({
      // Nombre: yup.string().required("Nombre requerido"),
      // Rubro: yup
      //   .object()
      //   .shape({
      //     id: yup.string().required("Rubro es requerido"),
      //     Nombre: yup.string().required("Rubro es requerido"),
      //   })
      //   .required("Rubro es requerido"),
    }),
  });

  useEffect(() => {
    if (useMuestras && useMuestras.muestra) {
      setValues({ ...(useMuestras.muestra as any) });
      handleSearchSampleResults(useMuestras.muestra);
      if (useMuestras.muestra.EtiquetaFormula) {
        setCalculatedEtiqueta(useMuestras.muestra.EtiquetaFormula);
      }
    }
  }, []);

  const handleSearchSampleResults = async (muestra: Muestra) => {
    const resultadoFormula = muestra?.CalculoFormula;
    const sectorId = muestra.Sector?.Id || "";

    if (
      resultadoFormula &&
      !muestra?.EtiquetaFormula &&
      muestra?.rubroId &&
      !muestra?.EtiquetaFormulaInvalida
    ) {
      setOutRange(false);

      console.log("herere");
      const res = await GetRangeEtiquetas(muestra?.rubroId, resultadoFormula);

      if (typeof res !== "string") {
        const update = { EtiquetaFormula: res, id: muestra.id || "" };
        await UpdateMuestra(update);
        const posObservada = muestra.Etiqueta?.Posicion || 0;
        const posCalculada = res.Posicion || 0;
        const muestraSave = {
          MuestraId: muestra.id || "",
          FechaMuestra: muestra.FechaCreacion as any,
          PosicionObservada: posObservada,
          PosicionCalculada: posCalculada,
        };
        await AddSectorMuestras(muestraSave, sectorId);
        setCalculatedEtiqueta(res);
      } else {
        setOutRange(true);
      }
    } else if (muestra?.EtiquetaFormula) {
      setOutRange(false);
      // console.log("si habia");
      const ultimaTemp = muestra?.UltimaTemporada;
      console.log('herereeeeeeeee',sectorId);

      const res = await GetSectorMuestras(
        muestra.FechaCreacion as any,
        sectorId,
        ultimaTemp
      );

      if (typeof res !== "string") {
        let dataA: any[] = [];
        let dataB: any[] = [];
        let categorias: any[] = [];
        // console.log(res);

        res.map((obj) => {
          dataA.push(obj.PosicionCalculada);
          dataB.push(obj.PosicionObservada);
          const dateString = obj.FechaMuestra.toDate().toLocaleDateString(
            "es-ES",
            {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            }
          );
          categorias.push(dateString);
        });

        setMuestrasCalculadas(dataA);
        setMuestrasEstimadas(dataB);
        setChartCategories(categorias);
      }
    } else {
      setOutRange(true);
    }
  };

  return (
    <Paper
      sx={{
        width: "100%",
        display: "flex",
        height: "100%",
        flexDirection: "column",
      }}
    >
      <Card>
        <CardContent>
          <Grid container justifyContent="space-evenly" spacing={2}>
            <Grid
              item
              xs={12}
              sm={8}
              container
              spacing={1}
              justifyContent="flex-start"
            >
              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">
                      {"Nombre Usuario"}
                    </Typography>
                  </Box>
                  <Box mt={1}>
                    <TextField
                      id="NombreUser"
                      value={values.User.Nombre + " " + values.User.Apellido}
                      variant="outlined"
                      autoComplete="off"
                      type="text"
                      fullWidth
                      inputProps={{ maxLength: 70 }}
                      onBlur={handleBlur}
                      // error={touched.Nombre && Boolean(errors.Nombre)}
                      // helperText={touched.Nombre && errors.Nombre}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">{"Campo"}</Typography>
                  </Box>
                  <Box mt={1}>
                    <TextField
                      id="NombreCampo"
                      value={values.Campo.Nombre}
                      variant="outlined"
                      autoComplete="off"
                      type="text"
                      fullWidth
                      inputProps={{ maxLength: 70 }}
                      onBlur={handleBlur}
                      // error={touched.Nombre && Boolean(errors.Nombre)}
                      // helperText={touched.Nombre && errors.Nombre}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">{"Sector"}</Typography>
                  </Box>
                  <Box mt={1}>
                    <TextField
                      id="NombreSector"
                      value={values.Sector.Nombre}
                      variant="outlined"
                      autoComplete="off"
                      type="text"
                      fullWidth
                      inputProps={{ maxLength: 70 }}
                      onBlur={handleBlur}
                      // error={touched.Nombre && Boolean(errors.Nombre)}
                      // helperText={touched.Nombre && errors.Nombre}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">{"Fecha Muestra"}</Typography>
                  </Box>
                  <Box mt={1}>
                    <TextField
                      id="Fecha"
                      value={values.FechaCreacion.toDate().toLocaleDateString(
                        "es-ES",
                        {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                      variant="outlined"
                      autoComplete="off"
                      type="text"
                      fullWidth
                      inputProps={{ maxLength: 70 }}
                      onBlur={handleBlur}
                      // error={touched.Nombre && Boolean(errors.Nombre)}
                      // helperText={touched.Nombre && errors.Nombre}
                    />
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">
                      {"Fenología Observada: " + values.Etiqueta?.Nombre}
                    </Typography>
                  </Box>
                  <Box mt={1}>
                    <Paper
                      variant="outlined"
                      style={{
                        height: 250,
                        width: 250,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={values.Etiqueta?.Foto?.Url}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={"UploadedImage"}
                      />
                    </Paper>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={4} container spacing={2}>
              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">{"Fotografía"}</Typography>
                  </Box>
                  <Box mt={1}>
                    <Paper
                      variant="outlined"
                      style={{
                        height: 250,
                        width: 250,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={values.FotoUrl}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={"UploadedImage"}
                      />
                    </Paper>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Box display="flex" sx={{ flexDirection: "column" }}>
                  <Box mt={1}>
                    <Typography variant="caption">{"Ubicación"}</Typography>
                  </Box>
                  <Box mt={1}>
                    <Paper
                      variant="outlined"
                      style={{
                        height: 250,
                        width: 250,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-m+ff0000(${values.Ubicacion.lng},${values.Ubicacion.lat})/${values.Ubicacion.lng},${values.Ubicacion.lat},16/500x300?access_token=pk.eyJ1Ijoiam9yZ2VsdWlzZ2F0aWNhdiIsImEiOiJjbDk1emcyY2MwN2p5M25teGsxdHAyNDZ0In0.2sZomCaMh9ilRIY_TuRwUQ`}
                        style={{
                          height: "100%",
                          width: "100%",
                          objectFit: "cover",
                        }}
                        alt={"UploadedImage"}
                      />
                    </Paper>
                    <Typography align="justify">{`Coords: ${values.Ubicacion.lng},${values.Ubicacion.lat}`}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Grid>
          <Divider marginY={5} />
          <Grid container justifyContent="space-evenly" spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box display="flex" sx={{ flexDirection: "column" }}>
                <Box mt={1}>
                  <Typography variant="caption">
                    {outRange || values?.EtiquetaFormulaInvalida
                      ? "Rango resultado no valido"
                      : "Resultados"}
                  </Typography>
                </Box>
                <Box mt={1}>
                  <Paper
                    variant="outlined"
                    style={{
                      height: "auto",
                      maxWidth: 450,
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <SampleChart
                      dataA={muestrasCalculadas}
                      dataB={muestrasEstimadas}
                      categories={chartCategories}
                    />
                  </Paper>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} container spacing={2}>
              {values?.CalculoFormula && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" sx={{ flexDirection: "column" }}>
                      <Box mt={1}>
                        <Typography variant="caption">
                          {"Fenología Referencia"}
                        </Typography>
                      </Box>
                      <Box mt={1}>
                        <TextField
                          id="CalculoFormula"
                          value={values.CalculoFormula}
                          variant="outlined"
                          autoComplete="off"
                          type="text"
                          fullWidth
                          inputProps={{ maxLength: 70 }}
                          // error={touched.Nombre && Boolean(errors.Nombre)}
                          // helperText={touched.Nombre && errors.Nombre}
                        />
                      </Box>
                    </Box>
                  </Grid>
                  {useMuestras && useMuestras?.muestra?.GDA && (
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" sx={{ flexDirection: "column" }}>
                        <Box mt={1}>
                          <Typography variant="caption">{"GDA"}</Typography>
                        </Box>
                        <Box mt={1}>
                          <TextField
                            id="GDA"
                            value={useMuestras?.muestra?.GDA}
                            variant="outlined"
                            autoComplete="off"
                            type="text"
                            fullWidth
                            inputProps={{ maxLength: 70 }}
                            // error={touched.Nombre && Boolean(errors.Nombre)}
                            // helperText={touched.Nombre && errors.Nombre}
                          />
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </>
              )}

              {calculatedEtiqueta && (
                <Grid item xs={12} sm={12}>
                  <Box display="flex" sx={{ flexDirection: "column" }}>
                    <Box mt={1}>
                      <Typography variant="caption">
                        {"Etiqueta Calculada: " + calculatedEtiqueta.Nombre}
                      </Typography>
                    </Box>
                    <Box mt={1}>
                      <Paper
                        variant="outlined"
                        style={{
                          height: 250,
                          width: 250,
                          borderRadius: 20,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={
                            calculatedEtiqueta?.Foto instanceof File
                              ? ""
                              : calculatedEtiqueta?.Foto?.Url
                          }
                          // src={values.Etiqueta?.Foto?.Url}
                          style={{
                            height: "100%",
                            width: "100%",
                            objectFit: "cover",
                          }}
                          alt={"UploadedImage"}
                        />
                      </Paper>
                    </Box>
                  </Box>
                </Grid>
              )}
              <Grid item></Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Paper>
  );
});

export default MuestraView;
