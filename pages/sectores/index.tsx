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

import { DateRange, DateRangePicker, LocalizationProvider } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { withStyles } from "@mui/styles";
import { es } from "date-fns/locale";
import { User } from "firebase/auth";
import { useRouter } from "next/router";
import { Search } from "react-feather";
import { useAuth } from "../../components/context/AuthProvider";
import { useRubro } from "../../components/context/RubrosProvider";
import SkeletonTable from "../../components/SkeletonTable";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import { Rubro } from "../../models/Rubro";
import { UserFirestore } from "../../models/UserFirestore";
import {
  CreateRubro,
  DeleteRubro,
  GetAllRubros,
  GetCountRubros,
  GetMoreRubros,
  GetRubros,
  UpdateRubro,
} from "../../services/firestore/rubros";
import { openSnack } from "../../services/firestore/snackbar";
import { cleanString, exportToCsv } from "../../utils/utils";
import NewEditRubro from "./components/NewEditRubo";
import {
  DeleteSector,
  GetCountSectores,
  GetMoreSectores,
  GetSectores,
  GetTottalyAllSectores,
  UpdateSector,
} from "../../services/firestore/sectores";
import { Sector } from "../../models/Sector";
import { GetAllUsers } from "../../services/firestore/users";
import { Users } from "../../models/Users";
import { GetAllCampos } from "../../services/firestore/campos";
import { Campos } from "../../models/Campos";
import { GetAllVariedadesByRubro } from "../../services/firestore/variedades";
import { Variedades } from "../../models/Variedades";
import NewEditSector from "./components/NewEditSector";

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
  // const [open, setOpen] = useState(false);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);
  // const handleConfirm = (values: Rubro) => {
  //   const file = values.Foto instanceof File ? values.Foto : null;

  //   setOpen(false);

  //   if (childCompRef.current) {
  //     childCompRef.current.CreateElement(values, file);
  //   }
  // };

  return (
    <Dashboard>
      <Helmet title="Sectores" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Sectores
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
          {userData?.Permisos && user && (
            <TableSectores ref={childCompRef} userAuth={user} />
          )}
        </Grid>
      </Grid>
      {/* <NewEditRubro
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
      /> */}
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

const TableSectores = forwardRef((props: DataViewProps, ref) => {
  const router = useRouter();
  const rubro = useRubro();
  const { userAuth, ...other } = props;
  const [filtro, setFilter] = useState<any>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [targetEdit, setTargetEdit] = useState<Sector | null>(null);
  const [targetDelete, setTargetDelete] = useState<Sector | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });

  const [camposList, setCamposList] = useState<Campos[]>([]);
  const [rubrosList, setRubrosList] = useState<Rubro[]>([]);

  // useImperativeHandle(ref, () => ({
  //   CreateElement,
  // }));

  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    { id: "Campo", alignment: "left", label: "Campo" },
    { id: "Rubro", alignment: "left", label: "Rubro" },
    { id: "Variedad", alignment: "left", label: "Variedad" },
    { id: "User", alignment: "left", label: "Usuario" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const {
    get: { data: sectores, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetSectores(rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountSectores(),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountSectores(orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreSectores(lastDoc, rowsPerPage, orderBy, orderDirection, filter),
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
    rows: sectores as any[],
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

  // const CreateElement = async (values: Rubro, file: File | null) => {
  //   setLoading(true);
  //   // const res = await CreateRubro(
  //   //   file ? (({ Foto, ...obj }) => obj)(values) : values,
  //   //   file
  //   // );
  //   setLoading(false);
  //   if (res.code === "Error") {
  //     setSnackState(openSnack("error", "¡No se ha podido crear!"));
  //   } else {
  //     setSnackState(openSnack("success", "Creado con éxito!"));
  //     // PROCEED TO RELOAD
  //     handleReload();
  //   }
  // };

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
      const res = await DeleteSector(id);
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

  const handleOpenDelete = (selected: Sector) => {
    setTargetDelete(selected);
    setOpenConfirm(true);
  };

  const handleOpenEdit = (selected: Sector) => {
    setTargetEdit(selected);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async (newData: Sector) => {
    handleCloseEdit();
    const data = (({ FechaCreacion, User, ...obj }) => obj)(newData);
    setLoading(true);
    const res = await UpdateSector(data);
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

  const getCamposList = async () => {
    const res = await GetAllCampos();

    if (typeof res !== "string") {
      setCamposList(res);
    }
  };
  const getRubrosList = async () => {
    const res = await GetAllRubros();

    if (typeof res !== "string") {
      setRubrosList(res);
    }
  };

  useEffect(() => {
    getCamposList();
    getRubrosList();
  }, []);

  const handleExport = async () => {
    const res = await GetTottalyAllSectores();

    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          "sectores.csv",
          res,
          [
            "Nombre",
            "Campo.Nombre",
            "Rubro.Nombre",
            "Variedad.Nombre",
            "User.Nombre",
            "User.Apellido",
          ],
          [
            "Nombre",
            "Campo",
            "Rubro",
            "Variedad",
            "Nombre Usuario",
            "Apellido Usuario",
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
        rubrosList={rubrosList}
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
                      rowsSelected.length < sectores.length
                    }
                    checked={
                      sectores.length > 0 &&
                      rowsSelected.length === sectores.length
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
                sectores
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
                        <TableCell>{row?.Campo?.Nombre}</TableCell>
                        <TableCell>{row?.Rubro?.Nombre}</TableCell>
                        <TableCell>{row?.Variedad?.Nombre}</TableCell>
                        <TableCell>
                          {row.User?.Nombre + " " + row.User?.Apellido}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                          <Box
                            mr={2}
                            display="flex"
                            justifyContent="space-evenly"
                          >
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
      <NewEditSector
        title="Editar"
        open={openEdit}
        onClose={handleCloseEdit}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
        campos={camposList}
        rubros={rubrosList}
      />
      <ConfirmDialog
        open={openConfirm}
        title="¿Desea eliminar este sector?"
        textContent="Se eliminara este sector"
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
  rubrosList: Rubro[];
}
const Filter: React.FC<FilterProps> = ({
  onSearch,
  camposList,
  rubrosList,
}) => {
  const [usuariosList, setUsuariosList] = useState<Users[]>([]);

  const [variedadesList, setVariedadesList] = useState<Variedades[]>([]);
  /// Field
  // const [nombre, setNombre] = useState("");
  // const [dateTo, setDateTo] = useState<DateRange<Date>>([null, null]);
  const [usuario, setUsuario] = useState<any>(null);
  const [campo, setCampo] = useState<any>(null);
  const [rubro, setRubro] = useState<any>(null);
  const [variedad, setVariedad] = useState<any>(null);

  const handleSearch = () => {
    const filter: any = {};

    // if (nombre) filter["NombreLower"] = cleanString(nombre);
    // if (dateTo[0] && dateTo[1]) filter["FechaCreacion"] = dateTo;
    if (usuario) filter["User.Id"] = usuario?.id;
    if (campo) filter["CampoId"] = campo?.id;
    if (rubro) filter["Rubro.id"] = rubro?.id;
    if (variedad) filter["Variedad.id"] = variedad?.id;

    onSearch(filter);
  };

  const getUsersList = async () => {
    const res = await GetAllUsers();

    if (typeof res !== "string") {
      setUsuariosList(res);
    }
  };

  const getVariedadesList = async (id: string) => {
    const res = await GetAllVariedadesByRubro(id);

    if (typeof res !== "string") {
      setVariedadesList(res);
    }
  };
  const cleanVariedades = () => {
    setVariedad(null);
    setVariedadesList([]);
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
        <Grid item xs={3} sm={3}>
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
        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="campos-select"
            options={camposList}
            value={campo}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setCampo(newValue);
              if (newValue) {
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
            id="rubro-select"
            options={rubrosList}
            value={rubro}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setRubro(newValue);
              setVariedad(null);
              if (newValue) {
                const id = newValue?.id;
                if (id) {
                  getVariedadesList(id);
                } else {
                  cleanVariedades();
                }
              } else {
                cleanVariedades();
              }
            }}
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
        <Grid item xs={3} sm={2}>
          <Autocomplete
            id="variedad-select"
            options={variedadesList}
            value={variedad}
            getOptionLabel={(option: any) => option?.Nombre}
            onChange={(_, newValue) => {
              setVariedad(newValue);
              if (newValue) {
              }
            }}
            renderInput={(params) => (
              <CssTextField
                {...params}
                // error={touched.Rubro && Boolean(errors.Rubro)}
                // helperText={touched.Rubro && errors.Rubro}
                placeholder="Variedad..."
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
          {/* <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
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
          </LocalizationProvider> */}
        </Grid>
      </Grid>
      <Divider mt={3} />
    </Paper>
  );
};

export default RubrosView;
