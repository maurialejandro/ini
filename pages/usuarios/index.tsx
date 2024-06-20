import React, { forwardRef, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectChangeEvent,
  Alert,
  Box,
  Breadcrumbs,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Checkbox,
  Divider as MuiDivider,
  Grid,
  Link as MuiLink,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  InputAdornment,
  TableFooter,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import { spacing } from "@mui/system";
import { Search, Edit, Delete, Add, BrowserUpdated } from "@mui/icons-material";
import { MinusCircle, Search as Search2 } from "react-feather";
import { DateRangePicker, LocalizationProvider, DateRange } from "@mui/lab";

import Link from "next/link";

import { useAuth } from "../../components/context/AuthProvider";
import { UserFirestore } from "../../models/UserFirestore";
import { User } from "firebase/auth";
import { Users } from "../../models/Users";
import Dashboard from "../../components/layouts/Dashboard";
import { CSVLink } from "react-csv";
import es from "date-fns/locale/es";

import {
  getAllUsers,
  deleteUser,
  searchUser,
  filterPermissions,
  filterDate,
  GetCountUsuarios,
  GetUsuarios,
  GetMoreUsuarios,
  GetAllUsers,
} from "../../services/firestore/users";

import styled from "styled-components/macro";
import { Helmet } from "react-helmet-async";
import { useRouter } from "next/router";
import { RefCompHandle } from "../campos";
import { useTable } from "../../hooks/useTable";
import { useFirebaseData } from "../../hooks/useFirebaseData";
import { useUsers } from "../../components/context/UsuariosProvider";

import SkeletonTable from "../../components/SkeletonTable";
import { openSnack } from "../../services/firestore/snackbar";
import ConfirmDialog from "../../components/ConfirmDialog";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import { withStyles } from "@mui/styles";
import { cleanString, exportToCsv } from "../../utils/utils";
import { GetTottalyAllSectores } from "../../services/firestore/sectores";
import { getAllRegiones, getComunas } from "../../services/firestore/regiones";
import { Regiones } from "../../models/Regiones";
import { useCargosList } from "../../hooks/useCargosList";
import { Cargo } from "../../models/Cargo";

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

const UsuariosView = () => {
  const childCompRef = useRef<RefCompHandle>();
  const { userData, user } = useAuth();

  return (
    <Dashboard>
      <Helmet title="Usuarios" />
      <Grid justifyContent="space-between">
        <Grid item>
          <Breadcrumbs>
            <Link href="/usuarios">
              <MuiLink href="/usuarios">Usuarios</MuiLink>
            </Link>
            <Typography>Listar</Typography>
          </Breadcrumbs>
          <Typography variant="h3" gutterBottom>
            Usuarios
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {userData?.Permisos === "Administrador" && user && (
            <TableUsers ref={childCompRef} userAuth={user} />
          )}
        </Grid>
      </Grid>
    </Dashboard>
  );
};

interface DataViewProps {
  userData?: UserFirestore;
  userAuth: User;
}

const TableUsers = forwardRef((props: DataViewProps, ref) => {
  const router = useRouter();
  const usuario = useUsers();
  const { userData, userAuth, ...other } = props;
  const [loading, setLoading] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Users | null>(null);
  const [search, setSearch] = useState("");
  const [permissions, setPermissions] = useState("");
  const [dateTo, setDateTo] = React.useState<DateRange<Date>>([null, null]);
  const [exports, setExports] = useState([]);
  const [elements, setElements] = useState<any>([]);

  const [filtro, setFilter] = useState<any>(null);
  const [listaRegiones, setListaRegiones] = useState<Regiones[]>([]);

  const searchHandle = (e: any) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search !== "") {
      const fetchData = async () => {
        setElements(
          await searchUser(
            search
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
          )
        );
      };
      fetchData().catch(console.error);
    } else if (elements.length !== 0) {
      handleReload();
    }
  }, [search]);

  //   useEffect(() => {
  //     if (elements) {
  //       handleUpdate(elements);
  //     }
  //   }, [elements]);

  //   useEffect(() => {
  //     if (permissions) {
  //       const fetchData = async () => {
  //         handleUpdate(await filterPermissions(permissions));
  //       };
  //       fetchData().catch(console.error);
  //     }
  //   }, [permissions]);

  //   useEffect(() => {
  //     if (dateTo[0] !== null && dateTo[1] !== null) {
  //       const fetchData = async () => {
  //         handleUpdate(await filterDate(dateTo));
  //       };
  //       fetchData().catch(console.error);
  //     }
  //   }, [dateTo]);

  const handleChangePermissions = (event: SelectChangeEvent) => {
    setPermissions(event.target.value);
  };

  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    { id: "Email", alignment: "left", label: "Email" },
    { id: "Fecha Inscripción", alignment: "left", label: "Fecha registro" },
    { id: "Tipo Usuario", alignment: "left", label: "Tipo usuario" },
    { id: "Cargo.id", alignment: "center", label: "Cargo" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const {
    get: { data: users, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetUsuarios(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountUsuarios(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountUsuarios(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreUsuarios(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
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
    rows: users as any[],
    totalDocs: count,
    defaultOrderBy: "NombreLower",
    onRequestSort: handleLoadData,
    onChangePage: handleLoadMoreData,
    onChangeRowsPerPage: handleLoadData,
    onLoad: handleLoadData,
  });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  const handleConfirmDialog = async () => {
    setOpenConfirm(false);
    if (!targetDelete) {
      return;
    }
    const res = await deleteUser(targetDelete);
    if (res.payload === "Usuario eliminado.") {
      setSnackState(openSnack("success", "¡Eliminado con éxito!"));
    } else {
      setSnackState(
        openSnack("warning", "¡Ha ocurrido un problema al eliminar!")
      );
    }
    setTargetDelete(null);
    handleReload();
  };

  const handleGoToSelected = (selected: any) => {
    usuario.user = selected;
    router.replace(`/usuarios/ver/${selected.id}`);
  };

  const fillInData = (users: any) => {
    setExports(dataCSV(users));
  };

  const dataCSV = (datas: any) => {
    const dataExport: any = [];
    datas.map((row: any, index: any) => {
      if (row.Creado_en) {
        row.Creado_en = new Date(row?.Creado_en?.seconds * 1000);
      }
      dataExport[index] = {
        Nombre: row.Nombre,
        Apellido: row.Apellido,
        Creado_en: row.Creado_en.toDateString(),
        Rut: row.Rut,
        Email: row.Email,
        Telefono: row.Telefono,
        Region: row.Region.Nombre,
        Comuna: row.Comuna.Nombre,
      };
    });
    return dataExport;
  };

  useEffect(() => {
    filtro && handleReload();
  }, [filtro]);

  const handleExport = async () => {
    const res = await GetAllUsers();
    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "usuarios.csv",
          res,
          [
            "Nombre",
            "Apellido",
            "Rut",
            "Email",
            "Telefono",
            "Region.Nombre",
            "Comuna.Nombre",
          ],
          ["Nombre", "Apellido", "RUT", "Email", "Telefono", "Region", "Comuna"]
        );
      }
    } else {
      setSnackState(openSnack("error", "No se ha podido descargar"));
    }
  };

  useEffect(() => {
    const loadRegions = async () => {
      const res = await getAllRegiones();
      if (res) {
        setListaRegiones(res);
      }
    };
    loadRegions();
  }, []);

  return (
    <>
      <Divider my={3} />
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
        regionesList={listaRegiones}
      />
      {/* <Grid container item xs={12}>
        <Grid item xs={6} textAlign="left">
          <CSVLink data={exports} filename="users.csv">
            <Button
              variant="contained"
              sx={{ my: 2 }}
              onClick={() => {
                fillInData(users);
              }}
            >
              Exportar
            </Button>
          </CSVLink>
        </Grid>
        <Grid item xs={6} textAlign="right">
          <Grid item>
            <TextField
              id="user-search"
              onChange={searchHandle}
              label="Buscar"
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Divider my={3} /> */}

      {/* <Grid container spacing={2}>
        <Grid item xs={8} textAlign="center">
          <Box sx={{ minWidth: 120 }}>
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
                    <TextField {...startProps} />
                    <Box sx={{ mx: 2 }}> - </Box>
                    <TextField {...endProps} />
                  </React.Fragment>
                )}
              />
            </LocalizationProvider>
          </Box>
        </Grid>

        <Grid item xs={4} textAlign="center">
          <Box sx={{ minWidht: 120 }}>
            <FormControl fullWidth>
              <InputLabel id="typeUser"> Tipo usuario </InputLabel>
              <Select
                labelId="typeUser"
                id="type-user-select"
                label="Type"
                value={permissions}
                onChange={handleChangePermissions}
              >
                <MenuItem id="admin" value="Administrador">
                  Administrador
                </MenuItem>
                <MenuItem id="manager" value="Manager">
                  Manager
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
      </Grid>
      <Divider my={3} /> */}
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
            aria-labelledby="tablaUsuarios"
            size={"medium"}
            aria-label="tabla usuario"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      rowsSelected.length > 0 &&
                      rowsSelected.length < users.length
                    }
                    checked={
                      users.length > 0 && rowsSelected.length === users.length
                    }
                    onChange={handleSelectAllClick}
                    inputProps={{ "aria-label": "selected all" }}
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
                        active={false}
                        disabled
                        // active={orderBy === headCell.id}
                        // direction={orderBy === headCell ? order : "asc"}
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
                users
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row: any, index) => {
                    const isItemSelected = isSelected(row?.id || "");
                    const labelId = `enhanced-table-checkbox-${index}`;
                    const fecha = new Date(row?.FechaCreacion?.seconds * 1000);

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={`${row.id}-{${index}}`}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            inputProps={{ "aria-labelledby": labelId }}
                            onClick={(event) => {
                              handleClickSelect(event, row.id!);
                            }}
                          />
                        </TableCell>
                        <TableCell align="left">{row?.Nombre}</TableCell>
                        <TableCell>{row?.Email}</TableCell>
                        <TableCell>
                          {fecha.toDateString() !== "Invalid Date"
                            ? fecha.toLocaleDateString()
                            : "Fecha no encontrada"}
                        </TableCell>
                        <TableCell>
                          {row?.Permisos ? row?.Permisos : "Usuario"}
                        </TableCell>
                        <TableCell>
                          {row?.Cargo ? row?.Cargo?.Nombre : "Habilitado Todo"}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Box
                            mr={2}
                            display="flex"
                            justifyContent="space-evenly"
                          >
                            <IconButton
                              aria-label="edit"
                              size="large"
                              onClick={() => handleGoToSelected(row)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              aria-label="dalete"
                              size="large"
                              onClick={() => {
                                setTargetDelete(row);
                                setOpenConfirm(true);
                              }}
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
      <ConfirmDialog
        open={openConfirm}
        title="¿Desea eliminar este usuario?"
        textContent="Se eliminara este usuario"
        onClose={() => {
          setOpenConfirm(false);
        }}
        onConfirm={handleConfirmDialog}
      />
      <Snackbar
        sx={{ width: 390, height: 150 }}
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
    </>
  );
});

interface FilterProps {
  onSearch: (values: any) => void;
  regionesList: any[];
}
const Filter: React.FC<FilterProps> = ({ onSearch, regionesList }) => {
  const [comunasList, setComunasList] = useState<any[]>([]);

  /// Field
  const [nombre, setNombre] = useState("");
  const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);
  const [region, setRegion] = useState<any>(null);
  const [comuna, setComuna] = useState<any>(null);
  const [cargo, setCargo] = useState<Cargo | null>(null);

  const handleSearch = () => {
    const filter: any = {};

    if (nombre) filter["NombreLower"] = cleanString(nombre);
    if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;
    if (region) filter["Region.id"] = region?.id;
    if (comuna) filter["Comuna.id"] = comuna?.id;
    if (cargo) filter["Cargo.id"] = cargo?.id;

    onSearch(filter);
  };

  const getComunasList = async (id: string) => {
    const res = await getComunas(id);
    if (typeof res) {
      setComunasList(res);
    }
  };
  const cleanComunas = () => {
    setComuna(null);
    setComunasList([]);
  };

  const handleClear = () => {
    setNombre("");
    setDateTo([null, null]);
    setRegion(null);
    setComuna(null);
    setCargo(null);
    onSearch({});
  };

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
    <Paper sx={{ paddingTop: 4, paddingX: 5, backgroundColor: "#76a747" }}>
      <Grid container spacing={1} justifyContent="flex-start">
        <Grid item xs={4} sm={3}>
          <CssTextField
            id="nombre"
            value={nombre}
            onChange={(e: any) => {
              setNombre(e.target.value);
            }}
            label="Nombre"
            variant="outlined"
            color="secondary"
            InputLabelProps={{
              style: {
                color: "#fff",
              },
            }}
            fullWidth
            onKeyPress={(ev) => {
              if (ev.key === "Enter") {
                handleSearch();
                ev.preventDefault();
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  onClick={handleSearch}
                  position="end"
                  style={{ color: "#fff" }}
                >
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="region-select"
            options={regionesList}
            value={region}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setRegion(newValue);
              cleanComunas();
              if (newValue) {
                const id = newValue?.id;
                if (id) {
                  getComunasList(id);
                }
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                placeholder="Region..."
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
            id="comuna-select"
            options={comunasList}
            value={comuna}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setComuna(newValue);
              if (newValue) {
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                placeholder="Comuna..."
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
            id="tipouser-select"
            options={["Administrador", "Manager"]}
            value={comuna}
            getOptionLabel={(option: any) => option}
            onChange={(_, newValue) => {
              setComuna(newValue);
              if (newValue) {
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                placeholder="Tipo Usuario..."
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
            id="cargo-select"
            options={cargos}
            value={cargo}
            getOptionLabel={(option) => option?.Nombre}
            onChange={(_, newValue) => setCargo(newValue)}
            renderInput={(params) => (
              <CssTextField
                {...params}
                placeholder="Cargo..."
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

        <Grid item xs={1} sm={1}>
          <Button
            variant="outlined"
            color="inherit"
            style={{ color: "#fff", height: "100%" }}
            onClick={handleSearch}
            fullWidth
          >
            <Search2 color="#fff" />
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

export default UsuariosView;
