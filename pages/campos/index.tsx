import {
  Alert,
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Checkbox,
  Divider as MuiDivider,
  Grid,
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
  InputAdornment,
  TableFooter,
  TablePagination,
  Autocomplete,
} from "@mui/material";
import { Search, Edit, Delete, BrowserUpdated } from "@mui/icons-material";

import { spacing } from "@mui/system";
import React, { forwardRef, useRef, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import ConfirmDialog from "../../components/ConfirmDialog";
import Dashboard from "../../components/layouts/Dashboard";
import { useFirebaseData } from "../../hooks/useFirebaseData";
import { useTable } from "../../hooks/useTable";
import { MinusCircle, Search as Search2 } from "react-feather";
import { useRouter } from "next/router";
import { useCampos } from "../../components/context/CamposProvider";

import { openSnack } from "../../services/firestore/snackbar";
import SkeletonTable from "../../components/SkeletonTable";
import { useAuth } from "../../components/context/AuthProvider";
import { UserFirestore } from "../../models/UserFirestore";
import { User } from "firebase/auth";
import {
  getAllCampos,
  deleteCampo,
  searchCampo,
  GetCountCampos,
  GetCampos,
  GetMoreCampos,
  GetAllCampos,
} from "../../services/firestore/campos";
import { Campos } from "../../models/Campos";
import { newUseTable } from "../../hooks/newUseTable";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { withStyles } from "@mui/styles";
import { cleanString, exportToCsv } from "../../utils/utils";
import { getAllRegiones, getComunas } from "../../services/firestore/regiones";
import { Regiones } from "../../models/Regiones";
// import { CSVLink } from "react-csv";

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

const CamposView = () => {
  const router = useRouter();
  const childCompRef = useRef<RefCompHandle>();

  const { userData, user } = useAuth();

  return (
    <Dashboard>
      <Helmet title="Campos" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Campos
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {userData?.Permisos && user && (
            <TableCampos ref={childCompRef} userAuth={user} />
          )}
        </Grid>
      </Grid>
    </Dashboard>
  );
};

export type RefCompHandle = {
  openCreate: () => void;
};

interface DataViewProps {
  userData?: UserFirestore;
  userAuth: User;
}

const TableCampos = forwardRef((props: DataViewProps, ref) => {
  const { userData, userAuth, ...other } = props;
  const router = useRouter();
  const campo = useCampos();
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Campos | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [elements, setElements] = useState<any>([]);
  const [exports, setExports] = useState([]);
  const user = userAuth;
  const searchHandle = (e: any) => {
    setSearch(e.target.value);
  };

  const [filtro, setFilter] = useState<any>(null);
  const [listaRegiones, setListaRegiones] = useState<Regiones[]>([]);

  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    { id: "Region", alignment: "left", label: "Region" },
    { id: "Comuna", alignment: "left", label: "Comuna" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const {
    get: { data: campos, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetCampos(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountCampos(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountCampos(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreCampos(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
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
    rows: campos as any[],
    totalDocs: count,
    defaultOrderBy: "Nombre",
    onRequestSort: handleLoadData,
    onChangePage: handleLoadMoreData,
    onChangeRowsPerPage: handleLoadData,
    onLoad: handleLoadData,
  });

  // const {
  //   get: { data: campos, error, isLoading },
  //   handleSort,
  //   handleReload,
  //   handleUpdate
  // } = useFirebaseData({
  //   getData: () => getAllCampos(),
  //   onRequestSort: (property, direction) =>
  //     getAllCampos(property, direction, 50),
  // });

  // const {
  //   handleClickSelect,
  //   handleSelectAllClick,
  //   page,
  //   isSelected,
  //   rowsPerPage,
  //   rowsSelected,
  //   orderBy,
  //   setOrderBy,
  //   order,
  //   handleRequestSort,
  // } = useTable({
  //   rows: campos as any,
  //   defaultOrderBy: "Nombre",
  //   onRequestSort: handleSort,
  // });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  const handleConfirmDialog = async () => {
    setOpenConfirm(false);
    if (!targetDelete) {
      return;
    }
    const res = await deleteCampo(targetDelete);
    if (res === "OK") {
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
    campo.campo = selected;
    router.replace(`/campos/ver/${selected.id}`);
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
        Campo: row.Nombre,
        Direccion: row.Direccion,
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
    const res = await GetAllCampos();
    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "campos.csv",
          res,
          [
            "Nombre",
            "Direccion",
            "Region.Nombre",
            "Comuna.Nombre",
            "User.Nombre",
            "User.Apellido",
          ],
          [
            "Nombre",
            "Direccion",
            "Region",
            "Comuna",
            "Nombre Usuario",
            "Apellido Usuario",
          ]
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
      </Grid> */}
      {/* <Divider my={5} /> */}
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
            aria-labelledby="tablaCampos"
            size={"medium"}
            aria-label="tabla campos"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      rowsSelected.length > 0 &&
                      rowsSelected.length < campos.length
                    }
                    checked={
                      campos.length > 0 && rowsSelected.length === campos.length
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
                campos
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
                        <TableCell align="left">{row?.Nombre}</TableCell>
                        <TableCell align="left">
                          {row?.Region?.Nombre}
                        </TableCell>
                        <TableCell align="left">
                          {row?.Comuna?.Nombre}
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
                              aria-label="delete"
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
        title="¿Desea eliminar este campo?"
        textContent="Se eliminara este campo"
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDialog}
      />
      <Snackbar
        sx={{ width: 390, height: 340 }}
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
  // const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);
  const [region, setRegion] = useState<any>(null);
  const [comuna, setComuna] = useState<any>(null);

  const handleSearch = () => {
    const filter: any = {};

    if (nombre) filter["Nombre"] = nombre;
    // if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;
    if (region) filter["Region.id"] = region?.id;
    if (comuna) filter["Comuna.id"] = comuna?.id;

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
    // setDateTo([null, null]);
    setRegion(null);
    setComuna(null);
    onSearch({});
  };

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
        {/* <Grid item xs={3} sm={2}>
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
        </Grid> */}
        {/* <Grid item xs={3} sm={3}>
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
        </Grid> */}

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

export default CamposView;
