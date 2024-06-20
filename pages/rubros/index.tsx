import { BrowserUpdated, Delete, Edit, Style } from "@mui/icons-material";
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
  Tooltip,
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
import { Clock, Download, Percent, Plus, Search } from "react-feather";
import { useAuth } from "../../components/context/AuthProvider";
import SkeletonTable from "../../components/SkeletonTable";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import { Rubro } from "../../models/Rubro";
import { UserFirestore } from "../../models/UserFirestore";
import {
  CreateRubro,
  DeleteRubro,
  EndRubroSeason,
  GetAllRubros,
  GetCountRubros,
  GetMoreRubros,
  GetRubros,
  UpdateRubro,
} from "../../services/firestore/rubros";
import { openSnack } from "../../services/firestore/snackbar";
import NewEditRubro from "./components/NewEditRubo";
import { useRouter } from "next/router";
import { useRubro } from "../../components/context/RubrosProvider";
import { withStyles } from "@mui/styles";
import { DateRange, DateRangePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { es } from "date-fns/locale";
import { cleanString, exportToCsv } from "../../utils/utils";
import NewEditFormula from "./components/NewEditFormula";
import ConfirmEndSeason from "./components/ConfirmEndSeason";

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

const RubrosView = () => {
  const childCompRef = useRef<RefCompHandle>();
  const { userData, user } = useAuth();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = (values: Rubro) => {
    const file = values.Foto instanceof File ? values.Foto : null;

    setOpen(false);

    if (childCompRef.current) {
      childCompRef.current.CreateElement(values, file);
    }
  };

  return (
    <Dashboard>
      <Helmet title="Rubros" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Rubros
          </Typography>
        </Grid>
        <Grid item>
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
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {userData?.Permisos && user && (
            <TableRubros ref={childCompRef} userAuth={user} />
          )}
        </Grid>
      </Grid>
      <NewEditRubro
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </Dashboard>
  );
};

export type RefCompHandle = {
  CreateElement: (values: Rubro, file: File | null) => void;
};

interface DataViewProps {
  userData?: UserFirestore;
  userAuth: User;
}

const TableRubros = forwardRef((props: DataViewProps, ref) => {
  const router = useRouter();
  const rubro = useRubro();
  const { userAuth, ...other } = props;
  const [filtro, setFilter] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openModalSeason, setOpenModalSeason] = useState(false);
  const [rubroSeason, setRubroSeason] = useState("");
  const handleOpenSeasonModal = (rubroId: string) => {
    setRubroSeason(rubroId);
    setOpenModalSeason(true);
  };
  const handleCloseSeasonModal = () => setOpenModalSeason(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditFormula, setOpenEditFormula] = useState(false);
  const [targetEdit, setTargetEdit] = useState<Rubro | null>(null);
  const [targetDelete, setTargetDelete] = useState<Rubro | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  useImperativeHandle(ref, () => ({
    CreateElement,
  }));

  const handleEndCurrentSeason = async () => {
    const rubroId = rubroSeason;
    setRubroSeason("");
    let rubroName = "";
    const findedRubro = rubros.find((r) => r.id === rubroId);
    if (findedRubro) rubroName = findedRubro.Nombre;
    const res = await EndRubroSeason(rubroId, rubroName);
    if (res === "Ok") {
      setSnackState(
        openSnack("success", "Se ha finalizado la temporada actual!")
      );
    } else {
      setSnackState(
        openSnack("error", "Ha ocurrido un problema al finalizar la temporada!")
      );
    }
    handleCloseSeasonModal();
  };

  const headCells: any[] = [
    { id: "NombreLower", alignment: "left", label: "Nombre" },
    { id: "Variedades", alignment: "left", label: "Variedades" },
    { id: "Etiquetas", alignment: "left", label: "Etiquetas" },
    { id: "Descripcion", alignment: "left", label: "Descripción" },
    { id: "FechaCreacion", alignment: "left", label: "Fecha Creación" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const {
    get: { data: rubros, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetRubros(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountRubros(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountRubros(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreRubros(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
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
    rows: rubros as any[],
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

  const CreateElement = async (values: Rubro, file: File | null) => {
    setLoading(true);
    const res = await CreateRubro(
      file ? (({ Foto, ...obj }) => obj)(values) : values,
      file
    );
    setLoading(false);
    if (res.code === "Error") {
      setSnackState(openSnack("error", "¡No se ha podido crear!"));
    } else {
      setSnackState(openSnack("success", "Creado con éxito!"));
      // PROCEED TO RELOAD
      handleReload();
    }
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setTargetEdit(null);
  };
  const handleCloseEditformula = () => {
    setOpenEditFormula(false);
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
      const res = await DeleteRubro(id);
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

  const handleOpenDelete = (selected: Rubro) => {
    setTargetDelete(selected);
    setOpenConfirm(true);
  };

  const handleOpenEdit = (selected: Rubro) => {
    setTargetEdit(selected);
    setOpenEdit(true);
  };

  const handleOpenEditFormula = (selected: Rubro) => {
    setTargetEdit(selected);
    setOpenEditFormula(true);
  };

  const handleConfirmEdit = async (newData: Rubro) => {
    const id = targetEdit?.id || "";
    handleCloseEdit();
    handleCloseEditformula();

    setLoading(true);
    const file = newData?.Foto instanceof File ? newData.Foto : null;
    const res = await UpdateRubro({ ...newData, id: id }, file);
    setLoading(false);
    if (res.code === "Error") {
      setSnackState(openSnack("error", "¡No se ha podido editar!"));
    } else {
      setSnackState(openSnack("success", "Editado con éxito!"));
      // PROCEED TO RELOAD
      handleReload();
    }
  };

  const handleGoToSelected = (selected: string, name: string) => {
    rubro?.setNombre(name);
    router.replace(`/etiquetas/${selected}`);
  };

  useEffect(() => {
    filtro && handleReload();
  }, [filtro]);

  const handleExport = async () => {
    const res = await GetAllRubros();

    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "rubros.csv",
          res,
          ["Nombre", "Descripcion", "Formula", "Etiquetas", "FechaCreacion"],
          [
            "Nombre",
            "Descripcion",
            "Formula",
            "Cantidad Etiquetas",
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
      <Filter onSearch={(values) => setFilter(values)} />
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
            aria-labelledby="tablaRubros"
            size={"medium"}
            aria-label="tabla rubros"
          >
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      rowsSelected.length > 0 &&
                      rowsSelected.length < rubros.length
                    }
                    checked={
                      rubros.length > 0 && rowsSelected.length === rubros.length
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
                rubros
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
                        <TableCell>{row?.Variedades}</TableCell>
                        <TableCell>{row?.Etiquetas}</TableCell>
                        <TableCell align="left">{row?.Descripcion}</TableCell>
                        <TableCell align="left">
                          {row.FechaCreacion.toDate().toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Box
                            mr={2}
                            display="flex"
                            justifyContent="space-evenly"
                          >
                            <Tooltip title="Etiquetas">
                              <IconButton
                                aria-label="edit"
                                size="large"
                                onClick={() =>
                                  handleGoToSelected(
                                    row.id as string,
                                    row.Nombre
                                  )
                                }
                              >
                                <Style />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Fórmula">
                              <IconButton
                                aria-label="formula"
                                size="large"
                                onClick={() => handleOpenEditFormula(row)}
                              >
                                <Percent />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Finalizar Temporada">
                              <IconButton
                                aria-label="temporada"
                                size="large"
                                onClick={() =>
                                  handleOpenSeasonModal(row.id || "")
                                }
                              >
                                <Clock />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                aria-label="edit"
                                size="large"
                                onClick={() => handleOpenEdit(row)}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton
                                aria-label="delete"
                                size="large"
                                onClick={() => handleOpenDelete(row)}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
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
      <NewEditRubro
        title="Editar"
        open={openEdit}
        onClose={handleCloseEdit}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
      />
      <NewEditFormula
        open={openEditFormula}
        onClose={handleCloseEditformula}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
      />
      <ConfirmEndSeason
        open={openModalSeason}
        onClose={handleCloseSeasonModal}
        onConfirm={handleEndCurrentSeason}
      />
      <ConfirmDialog
        open={openConfirm}
        title="¿Desea eliminar este rubro?"
        textContent="Se eliminara este rubro"
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
}
const Filter: React.FC<FilterProps> = ({ onSearch }) => {
  /// Field
  const [nombre, setNombre] = useState("");
  const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);

  //
  const handleSearch = () => {
    const filter: any = {};
    if (nombre) filter["NombreLower"] = cleanString(nombre);
    if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;

    onSearch(filter);
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
        <Grid item xs={4} sm={3}>
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

          {/* <Autocomplete
            id="rubro-select"
            options={rubros}
            value={rubro}
            getOptionLabel={(option: Rubro) => option?.Nombre}
            onChange={(_, newValue) => setRubro(newValue)}
            renderInput={(params) => (
              <CssTextField
                {...params}
                // error={touched.Rubro && Boolean(errors.Rubro)}
                // helperText={touched.Rubro && errors.Rubro}
                placeholder="Rubro..."
                inputProps={{
                  ...params.inputProps,
                  autoComplete: "new-password", // disable autocomplete and autofill
                }}
              />
            )}
          /> */}
        </Grid>
      </Grid>
      <Divider mt={3} />
    </Paper>
  );
};

export default RubrosView;
