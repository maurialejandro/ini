import { BrowserUpdated, Delete, Edit, Search } from "@mui/icons-material";
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
import {
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
import { useFirebaseData } from "../../hooks/useFirebaseData";
import { useTable } from "../../hooks/useTable";

import { User } from "firebase/auth";
import { Plus } from "react-feather";
import { useAuth } from "../../components/context/AuthProvider";
import SkeletonTable from "../../components/SkeletonTable";
import { Variedades } from "../../models/Variedades";
import { UserFirestore } from "../../models/UserFirestore";
import {
  CreateVariedad,
  DeleteVariedad,
  GetAllVariedades,
  GetCountVariedades,
  GetMoreVariedades,
  GetVariedades,
  UpdateVariedad,
} from "../../services/firestore/variedades";
import { Rubro } from "../../models/Rubro";
import { GetRubros, GetRubros2 } from "../../services/firestore/rubros";
import { openSnack } from "../../services/firestore/snackbar";
import NewEditVariedad from "./components/NewEditVariedades";
import { withStyles } from "@mui/styles";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
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
      <Helmet title="Variedades" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Variedades
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
  const [filtro, setFilter] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [targetEdit, setTargetEdit] = useState<Variedades | null>(null);
  const [targetDelete, setTargetDelete] = useState<Variedades | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  useImperativeHandle(ref, () => ({
    CreateElement,
  }));

  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    { id: "Rubro.Nombre", alignment: "left", label: "Rubro" },
    { id: "Descripcion", alignment: "left", label: "Descripción" },
    { id: "FechaCreacion", alignment: "left", label: "Fecha Creación" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const {
    get: { data: variedades, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetVariedades(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountVariedades(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountVariedades(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreVariedades(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
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
    rows: variedades as any[],
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

  const CreateElement = async (values: Variedades, file: File | null) => {
    setLoading(true);
    const res = await CreateVariedad(
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
  const handleCloseDelete = () => {
    setOpenConfirm(false);
    setTargetDelete(null);
  };

  const handleConfirmDialog = async () => {
    const id = targetDelete?.id || "";
    const rubroId: string = targetDelete?.Rubro.id || "";
    handleCloseDelete();
    if (id) {
      setLoading(true);
      const res = await DeleteVariedad(id, rubroId);
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

  const handleOpenDelete = (selected: Variedades) => {
    setTargetDelete(selected);
    setOpenConfirm(true);
  };

  const handleOpenEdit = (selected: Variedades) => {
    setTargetEdit(selected);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async (newData: Variedades) => {
    const oldRubroId: string = targetEdit?.Rubro.id || "";
    handleCloseEdit();
    setLoading(true);
    const file = newData.Foto instanceof File ? newData.Foto : null;
    const res = await UpdateVariedad(newData, file, oldRubroId);
    setLoading(false);
    if (res.code === "Error") {
      setSnackState(openSnack("error", "¡No se ha podido editar!"));
    } else {
      setSnackState(openSnack("success", "Editado con éxito!"));
      // PROCEED TO RELOAD
      handleReload();
    }
  };

  useEffect(() => {
    filtro && handleReload();
  }, [filtro]);

  const handleExport = async () => {
    const res = await GetAllVariedades();

    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "variedades.csv",
          res,
          ["Nombre", "Descripcion", "Rubro.Nombre", "FechaCreacion"],
          ["Nombre", "Descripcion", "Rubro", "FechaCreacion"]
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

      <Filter onSearch={(values) => setFilter(values)} rubros={rubros} />

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
                      rowsSelected.length < variedades.length
                    }
                    checked={
                      variedades.length > 0 &&
                      rowsSelected.length === variedades.length
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
                variedades
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
                        <TableCell align="left">{row?.Rubro.Nombre}</TableCell>
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
                            <IconButton
                              aria-label="edit"
                              size="large"
                              onClick={() => handleOpenEdit(row)}
                            >
                              <Edit />
                            </IconButton>
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
      <NewEditVariedad
        title="Editar"
        open={openEdit}
        onClose={handleCloseEdit}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
        rubros={rubros}
      />
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
  rubros: Rubro[];
}
const Filter: React.FC<FilterProps> = ({ onSearch, rubros }) => {
  /// Field
  const [nombre, setNombre] = useState("");
  const [rubro, setRubro] = useState<any>(null);

  //
  const handleSearch = () => {
    const filter: any = {};
    if (nombre) filter["NombreLower"] = nombre;
    if (rubro) filter["Rubro.id"] = rubro?.id;
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
          <Autocomplete
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
          />
        </Grid>
      </Grid>
      <Divider mt={3} />
    </Paper>
  );
};

export default VariedadesView;
