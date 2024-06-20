import {
  BrowserUpdated,
  Delete,
  Edit,
  RemoveRedEye,
} from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider as MuiDivider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";

import { spacing } from "@mui/system";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import ConfirmDialog from "../../components/ConfirmDialog";
import Dashboard from "../../components/layouts/Dashboard";

import { User } from "firebase/auth";
import { MinusCircle, Plus, Search } from "react-feather";
import SkeletonTable from "../../components/SkeletonTable";
import { Rubro } from "../../models/Rubro";
import { UserFirestore } from "../../models/UserFirestore";
import { Variedades } from "../../models/Variedades";
import { GetRubros2 } from "../../services/firestore/rubros";
import { openSnack } from "../../services/firestore/snackbar";
import {
  CreateVariedad,
  DeleteVariedad,
  GetCountVariedades,
  GetMoreVariedades,
  GetVariedades,
  UpdateVariedad,
} from "../../services/firestore/variedades";
// import NewEditVariedad from "./components/NewEditVariedades";
import { withStyles } from "@mui/styles";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import NewEditVariedad from "./components/NewEditVariedades";
import { useRouter } from "next/router";
import { GetAllCampos } from "../../services/firestore/campos";
import { Campos } from "../../models/Campos";
import { GetAllUsers } from "../../services/firestore/users";
import { Users } from "../../models/Users";
import { DateRange, DateRangePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { es } from "date-fns/locale";
import { Sector } from "../../models/Sector";
import { GetAllSectores } from "../../services/firestore/sectores";
import { Muestra } from "../../models/Muestra";
import {
  DeleteMuestra,
  GetAllMuestras,
  GetCountMuestras,
  GetMoreMuestras,
  GetMuestras,
} from "../../services/firestore/muestras";
import { useMuestra } from "../../components/context/MuestrasProvider";
import { exportToCsv } from "../../utils/utils";

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

const VariedadesView = () => {
  const childCompRef = useRef<RefCompHandle>();
  const [rubros, setRubros] = useState<Rubro[]>([]);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = (values: Variedades) => {
    const file = values.Foto instanceof File ? values.Foto : null;
    setOpen(false);
    if (childCompRef.current) {
      childCompRef.current.CreateElement(values, file);
    }
  };

  useEffect(() => {
    console.log("Getting al rubros list");
    const getRubros = async () => setRubros(await GetRubros2());
    getRubros();
  }, []);

  return (
    <Dashboard>
      <Helmet title="Muestras" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Muestras
          </Typography>
        </Grid>
        {/* <Grid item>
          <Box display="flex">
            <Box order={1}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Plus />}
                onClick={handleOpen}
              >
                Añadir
              </Button>
            </Box>
          </Box>
        </Grid> */}
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TableVariedades ref={childCompRef} rubros={rubros} />
        </Grid>
      </Grid>
      <NewEditVariedad
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        rubros={rubros}
      />
    </Dashboard>
  );
};

export type RefCompHandle = {
  CreateElement: (values: Variedades, file: File | null) => void;
};

interface DataViewProps {
  userData?: UserFirestore;
  userAuth?: User;
  rubros: Rubro[];
}

const TableVariedades = forwardRef((props: DataViewProps, ref) => {
  const { rubros, ...other } = props;
  const router = useRouter();
  const useMuestras = useMuestra();

  const [filtro, setFilter] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [targetEdit, setTargetEdit] = useState<Muestra | null>(null);
  const [targetDelete, setTargetDelete] = useState<Muestra | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const [camposList, setCamposList] = useState<Campos[]>([]);

  useImperativeHandle(ref, () => ({
    CreateElement,
  }));

  const headCells: any[] = [
    { id: "User", alignment: "left", label: "Usuario" },
    { id: "Campo", alignment: "left", label: "Campo" },
    { id: "Sector", alignment: "left", label: "Sector" },
    { id: "FechaCreacion", alignment: "left", label: "Fecha Muestra" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const {
    get: { data: muestras, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetMuestras(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountMuestras(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountMuestras(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreMuestras(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
  });

  const {
    handleClickSelect,
    handleSelectAllClick,
    handleChangeRowsPerPage,
    page,
    isSelected,
    rowsPerPage,
    rowsSelected,
    orderBy,
    order,
    handleRequestSort,
    handleChangePage,
  } = newUseTable({
    rows: muestras as any[],
    totalDocs: count,
    defaultOrderBy: "FechaCreacion",
    onRequestSort: handleLoadData,
    onChangePage: handleLoadMoreData,
    onChangeRowsPerPage: handleLoadData,
    onLoad: handleLoadData,
  });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  const CreateElement = async (values: Muestra, file: File | null) => {
    // setLoading(true);
    // const res = await CreateVariedad(
    //   file ? (({ Foto, ...obj }) => obj)(values) : values,
    //   file
    // );
    // setLoading(false);
    // if (res.code === "Error") {
    //   setSnackState(openSnack("error", "¡No se ha podido crear!"));
    // } else {
    //   setSnackState(openSnack("success", "Creado con éxito!"));
    //   // PROCEED TO RELOAD
    //   handleReload();
    // }
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setTargetEdit(null);
  };
  const handleCloseDelete = () => {
    setOpenConfirm(false);
    setTargetDelete(null);
  };

  const handleConfirmDialog = async () => {
    const id = targetDelete?.id || "";
    handleCloseDelete();
    if (id) {
      setLoading(true);
      const res = await DeleteMuestra(id);
      setLoading(false);
      if (res.code === "Error") {
        setSnackState(openSnack("error", "¡No se ha podido eliminar!"));
      } else {
        setSnackState(openSnack("success", "Eliminado con éxito!"));
        // PROCEED TO RELOAD
        handleReload();
      }
    }
  };

  const handleOpenDelete = (selected: Muestra) => {
    setTargetDelete(selected);
    setOpenConfirm(true);
  };

  const handleOpenEdit = (selected: Muestra) => {
    setTargetEdit(selected);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async (newData: Variedades) => {
    // const oldRubroId: string = targetEdit?.Rubro.id || "";
    // handleCloseEdit();
    // setLoading(true);
    // const file = newData.Foto instanceof File ? newData.Foto : null;
    // const res = await UpdateVariedad(newData, file, oldRubroId);
    // setLoading(false);
    // if (res.code === "Error") {
    //   setSnackState(openSnack("error", "¡No se ha podido editar!"));
    // } else {
    //   setSnackState(openSnack("success", "Editado con éxito!"));
    //   // PROCEED TO RELOAD
    //   handleReload();
    // }
  };

  const handleGoToSelected = (Muestra: Muestra) => {
    if (useMuestras) {
      useMuestras.updateMuestra(Muestra);
      const id = Muestra.id || "";

      router.replace(`/muestras/ver/${id}`);
    }
  };

  const getCamposList = async () => {
    const res = await GetAllCampos();

    if (typeof res !== "string") {
      setCamposList(res);
    }
  };

  useEffect(() => {
    getCamposList();
    // getRubrosList();
  }, []);

  useEffect(() => {
    filtro && handleReload();
  }, [filtro]);

  const handleExport = async () => {
    const res = await GetAllMuestras();

    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "muestras.csv",
          res,
          [
            "User.Nombre",
            "User.Apellido",
            "Ubicacion.lat",
            "Ubicacion.lng",
            "Campo.Nombre",
            "Sector.Nombre",
            "Etiqueta.Nombre",
            "GDA",
            "CalculoFormula",
            "FechaCreacion",
          ],
          [
            "Nombre Usuario",
            "Apellido Usuario",
            "Latitud",
            "Longitud",
            "Campo",
            "Sector",
            "Etiqueta",
            "GDA",
            "Cáclculo de Fórmula",
            "Fecha Creación",
          ]
        );
      }
    } else {
      setSnackState(openSnack("error", "No se ha podido descargar"));
    }
  };

  return (
    <>
      <Divider my={4} />

      <Grid container style={{ marginBottom: 5 }}>
        <Button
          variant="contained"
          style={{ backgroundColor: "#76a747" }}
          onClick={handleExport}
          startIcon={<BrowserUpdated />}
        >
          Exportar
        </Button>
      </Grid>

      <Filter
        onSearch={(values) => setFilter(values)}
        camposList={camposList}
      />

      <Paper
        sx={{
          width: "100%",
          minHeight: "62vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer style={{ flex: 1 }}>
          <Table
            aria-labelledby="tablaVariedades"
            size={"medium"}
            aria-label="tabla variedades"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      rowsSelected.length > 0 &&
                      rowsSelected.length < muestras.length
                    }
                    checked={
                      muestras.length > 0 &&
                      rowsSelected.length === muestras.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "select all" }}
                  />
                </TableCell>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.alignment as any}
                    padding={headCell.disablePadding ? "none" : "normal"}
                    sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.id === "Acciones" ? (
                      headCell.id
                    ) : (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : "asc"}
                        onClick={() => {
                          handleRequestSort(headCell.id);
                        }}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {!loading && !isLoading ? (
                muestras
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row?.id || "");
                    const labelId = `enhanced-table-checkbox-${index}`;
                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={`${row.id}-${index}`}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(event) =>
                              handleClickSelect(event, row.id!)
                            }
                          />
                        </TableCell>
                        <TableCell align="left">
                          {row?.User?.Nombre + " " + row?.User?.Apellido}
                        </TableCell>
                        <TableCell align="left">{row?.Campo?.Nombre}</TableCell>
                        <TableCell align="left">
                          {row?.Sector?.Nombre}
                        </TableCell>
                        <TableCell align="left">
                          {row?.FechaCreacion &&
                            row.FechaCreacion.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Box
                            mr={2}
                            display="flex"
                            justifyContent="space-evenly"
                          >
                            <IconButton
                              aria-label="Ver"
                              size="large"
                              onClick={() => handleGoToSelected(row)}
                            >
                              <RemoveRedEye />
                            </IconButton>
                            {/* <IconButton
                              aria-label="edit"
                              size="large"
                              onClick={() => handleOpenEdit(row)}
                            >
                              <Edit />
                            </IconButton> */}
                            <IconButton
                              aria-label="delete"
                              size="large"
                              onClick={() => handleOpenDelete(row)}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <SkeletonTable colSpan={5} limit={5} />
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TablePagination
                  align="right"
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  count={count}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[20, 50, 100, 200]}
                />
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Paper>
      {/* <NewEditVariedad
        title="Editar"
        open={openEdit}
        onClose={handleCloseEdit}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
        rubros={rubros}
      /> */}
      <ConfirmDialog
        open={openConfirm}
        title="¿Desea eliminar esta variedad?"
        textContent="Se eliminara esta variedad"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDialog}
      />
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
    </>
  );
});

interface FilterProps {
  onSearch: (values: any) => void;
  camposList: Campos[];
}
const Filter: React.FC<FilterProps> = ({ onSearch, camposList }) => {
  const [usuariosList, setUsuariosList] = useState<Users[]>([]);
  const [sectoresList, setSectoresList] = useState<Sector[]>([]);

  /// Field
  // const [nombre, setNombre] = useState("");
  const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);
  const [usuario, setUsuario] = useState<any>(null);
  const [campo, setCampo] = useState<any>(null);
  const [sector, setSector] = useState<any>(null);

  const handleSearch = () => {
    const filter: any = {};

    // if (nombre) filter["NombreLower"] = cleanString(nombre);
    if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;
    if (usuario) filter["User.Id"] = usuario?.id;
    if (campo) filter["Campo.Id"] = campo?.id;
    if (sector) filter["Sector.Id"] = sector?.id;

    onSearch(filter);
  };
  const handleClear = () => {
    setDateTo([null, null]);
    setUsuario(null);
    setCampo(null);
    setSector(null);
    onSearch({});
  };

  const getUsersList = async () => {
    const res = await GetAllUsers();

    if (typeof res !== "string") {
      setUsuariosList(res);
    }
  };

  const getSectoresList = async (id: string) => {
    const res = await GetAllSectores(id);
    if (typeof res !== "string") {
      setSectoresList(res);
    }
  };
  const cleanSectores = () => {
    setSector(null);
    setSectoresList([]);
  };

  useEffect(() => {
    const getAutocompleteOptions = () => {
      getUsersList();
    };
    getAutocompleteOptions();
  }, []);

  return (
    <Paper sx={{ paddingTop: 4, paddingX: 5, backgroundColor: "#76a747" }}>
      <Grid container spacing={1} justifyContent="flex-start">
        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="usuario-select"
            options={usuariosList}
            value={usuario}
            getOptionLabel={(option: any) =>
              option?.Nombre + " " + option?.Apellido
            }
            onChange={(_, newValue) => {
              setUsuario(newValue);
              if (newValue) {
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                key={params.InputLabelProps.id}
                // error={touched.Rubro && Boolean(errors.Rubro)}
                // helperText={touched.Rubro && errors.Rubro}
                placeholder="Usuario..."
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={3} sm={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <DateRangePicker
              startText="Fecha-desde"
              endText="Fecha-hasta"
              value={dateTo}
              onChange={(date) => {
                setDateTo(date);
              }}
              renderInput={(startProps, endProps) => (
                <React.Fragment>
                  <CssTextField {...startProps} />
                  <Box sx={{ mx: 2 }}> - </Box>
                  <CssTextField {...endProps} />
                </React.Fragment>
              )}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="campos-select"
            options={camposList}
            value={campo}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setCampo(newValue);
              cleanSectores();
              if (newValue) {
                const id = newValue?.id;
                if (id) {
                  getSectoresList(id);
                }
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                // error={touched.Rubro && Boolean(errors.Rubro)}
                // helperText={touched.Rubro && errors.Rubro}
                placeholder="Campo..."
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="sectores-select"
            options={sectoresList}
            value={sector}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setSector(newValue);
              if (newValue) {
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                // error={touched.Rubro && Boolean(errors.Rubro)}
                // helperText={touched.Rubro && errors.Rubro}
                placeholder="Sector..."
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={1} sm={1}>
          <Button
            variant="outlined"
            color="inherit"
            style={{ color: "#fff", height: "100%" }}
            onClick={handleSearch}
            fullWidth
          >
            <Search color="#fff" />
          </Button>
        </Grid>
        <Grid item xs={1} sm={1}>
          <Button
            variant="outlined"
            color="inherit"
            style={{ color: "#fff", height: "100%" }}
            onClick={handleClear}
            fullWidth
          >
            <MinusCircle color="#fff" />
          </Button>
        </Grid>
      </Grid>
      <Divider mt={3} />
    </Paper>
  );
};

export default VariedadesView;
