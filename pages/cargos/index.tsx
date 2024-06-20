import { BrowserUpdated, Delete, Edit, Search } from "@mui/icons-material";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  InputAdornment,
  Divider as MuiDivider,
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
import { useRouter } from "next/router";
import React, { forwardRef, useEffect, useRef, useState } from "react";
import { MinusCircle, Plus, Search as Search2 } from "react-feather";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
import ConfirmDialog from "../../components/ConfirmDialog";
import Dashboard from "../../components/layouts/Dashboard";

import { withStyles } from "@mui/styles";
import { User } from "firebase/auth";
import SkeletonTable from "../../components/SkeletonTable";
import { useAuth } from "../../components/context/AuthProvider";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import { useProveedoresList } from "../../hooks/useProveedoresList";
import { Proveedor } from "../../models/Proveedor";
import { Regiones } from "../../models/Regiones";
import { UserFirestore } from "../../models/UserFirestore";
import { deleteProvider } from "../../services/firestore/proveedores";
import { getAllRegiones, getComunas } from "../../services/firestore/regiones";
import { openSnack } from "../../services/firestore/snackbar";
import { exportToCsv } from "../../utils/utils";
import { useCargosList } from "../../hooks/useCargosList";
import { Cargo } from "../../models/Cargo";
import { deleteCharge } from "../../services/firestore/cargos";

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

  const handleCreate = () => router.replace(`/cargos/crear/`);

  return (
    <Dashboard>
      <Helmet title="Cargos" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Cargos
          </Typography>
        </Grid>
        <Grid item>
          <Box display="flex">
            <Box order={1}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<Plus />}
                onClick={handleCreate}
              >
                Añadir
              </Button>
            </Box>
          </Box>
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
  const [openConfirm, setOpenConfirm] = useState(false);
  const [targetDelete, setTargetDelete] = useState<Cargo | null>(null);
  // const user = userAuth;

  const [filtro, setFilter] = useState<any>(null);
  // const [listaRegiones, setListaRegiones] = useState<Regiones[]>([]);

  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    // { id: "Web", alignment: "left", label: "Web" },
    // { id: "Region", alignment: "left", label: "Region" },
    // { id: "Comuna", alignment: "left", label: "Comuna" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const { loadCharges, loadMoreCharges, loadCount, loadExportData } =
    useCargosList({
      filtro,
    });

  const {
    get: { data: cargos, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: loadCharges,
    getDocsCount: loadCount,
    getDocsCountFiltered: loadCount,
    getMoreData: loadMoreCharges,
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
    rows: cargos as Cargo[],
    totalDocs: count,
    defaultOrderBy: "Nombre",
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
    const res = await deleteCharge(targetDelete);
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
    router.replace(`/cargos/ver/${selected.id}`);
  };

  useEffect(() => {
    filtro && handleReload();
  }, [filtro]);

  const handleExport = async () => {
    const res = await loadExportData();
    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "cargos.csv",
          res,
          [
            "Nombre",
            "FechaCreacion",
            // "Region.Nombre",
            // "Comuna.Nombre",
            // "Email",
            // "Telefono",
            // "Web",
          ],
          [
            "Nombre",
            "Fecha",
            // "Region",
            // "Comuna",
            // "Email",
            // "Telefono",
            // "Web",
          ]
        );
      }
    } else {
      setSnackState(openSnack("error", "No se ha podido descargar"));
    }
  };

  // useEffect(() => {
  //   const loadRegions = async () => {
  //     const res = await getAllRegiones();
  //     if (res) {
  //       setListaRegiones(res);
  //     }
  //   };
  //   loadRegions();
  // }, []);

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
        // regionesList={listaRegiones}
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
                      rowsSelected.length < cargos.length
                    }
                    checked={
                      cargos.length > 0 && rowsSelected.length === cargos.length
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
              {!isLoading ? (
                cargos
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
                        {/* <TableCell align="left">{row?.Web}</TableCell>
                        <TableCell align="left">
                          {row?.Region?.Nombre}
                        </TableCell>
                        <TableCell align="left">
                          {row?.Comuna?.Nombre}
                        </TableCell> */}
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
        title="¿Desea eliminar este cargo?"
        textContent="Se eliminará este cargo. Esta acción no se puede deshacer"
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
  // regionesList: any[];
}
const Filter: React.FC<FilterProps> = ({ onSearch }) => {
  // const [comunasList, setComunasList] = useState<any[]>([]);

  /// Field
  const [nombre, setNombre] = useState("");
  // const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);
  // const [region, setRegion] = useState<any>(null);
  // const [comuna, setComuna] = useState<any>(null);

  const handleSearch = () => {
    const filter: any = {};

    if (nombre) filter["Nombre"] = nombre;
    // if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;
    // if (region) filter["Region.id"] = region?.id;
    // if (comuna) filter["Comuna.id"] = comuna?.id;

    onSearch(filter);
  };

  // const getComunasList = async (id: string) => {
  //   const res = await getComunas(id);
  //   if (typeof res) {
  //     setComunasList(res);
  //   }
  // };
  // const cleanComunas = () => {
  //   setComuna(null);
  //   setComunasList([]);
  // };

  const handleClear = () => {
    setNombre("");
    // setDateTo([null, null]);
    // setRegion(null);
    // setComuna(null);
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

        {/* <Grid item xs={3} sm={2}>
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
        </Grid> */}
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
