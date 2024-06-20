import { BrowserUpdated, Delete, Edit, Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  Divider as MuiDivider,
  Link as MuiLink,
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
import { User } from "firebase/auth";
import { Plus } from "react-feather";
import SkeletonTable from "../../components/SkeletonTable";
import { Etiquetas } from "../../models/Etiquetas";
import { UserFirestore } from "../../models/UserFirestore";
import { withStyles } from "@mui/styles";
import { newUseFirebaseData } from "../../hooks/newUseFirebaseData";
import { newUseTable } from "../../hooks/newUseTable";
import { Rubro } from "../../models/Rubro";
import {
  CreateEtiqueta,
  DeleteEtiqueta,
  GetAllEtiquetas,
  GetCountEtiquetas,
  GetEtiquetas,
  GetMoreEtiquetas,
  UpdateEtiqueta,
} from "../../services/firestore/etiquetas";
import { GetRubros, GetRubros2 } from "../../services/firestore/rubros";
import { openSnack } from "../../services/firestore/snackbar";
import NewEditEtiquetas from "./components/NewEditEtiquetas";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { useRubro } from "../../components/context/RubrosProvider";
import { cleanString, exportToCsv } from "../../utils/utils";

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

const EtiquetasView = () => {
  const router = useRouter();
  const rubro = useRubro();
  const childCompRef = useRef<RefCompHandle>();
  const [rubros, setRubros] = useState<Rubro[]>([]);
  const { id } = router.query;

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleConfirm = (values: Etiquetas) => {
    const file = values.Foto instanceof File ? values.Foto : null;
    setOpen(false);
    if (childCompRef.current) {
      childCompRef.current.CreateElement(values, file);
    }
  };

  useEffect(() => {
    // console.log("Getting al rubros list");
    const getRubros = async () => setRubros(await GetRubros2());
    getRubros();
  }, []);

  return (
    <Dashboard>
      <Helmet title="Etiquetas" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Etiquetas {rubro?.nombre}
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
      <Grid style={{ marginBottom: 15 }}>
        <Breadcrumbs>
          <Link href="/rubros">
            <MuiLink href="/rubros">Rubros</MuiLink>
          </Link>

          <Typography>Lista</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TableEtiquetas
            ref={childCompRef}
            rubroName={rubro?.nombre}
            rubros={rubros}
            rubroId={(id as string) || ""}
          />
        </Grid>
      </Grid>
      <NewEditEtiquetas
        open={open}
        onClose={handleClose}
        onConfirm={handleConfirm}
        rubros={rubros}
      />
    </Dashboard>
  );
};

export type RefCompHandle = {
  CreateElement: (values: Etiquetas, file: File | null) => void;
};

interface DataViewProps {
  userData?: UserFirestore;
  userAuth?: User;
  rubros: Rubro[];
  rubroName?: string;
  // router: NextRouter;
  rubroId: string;
}

const TableEtiquetas = forwardRef((props: DataViewProps, ref) => {
  const { rubros, rubroId, rubroName, ...other } = props;
  // const [pageRows, setPageRows] = useState(20);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [targetEdit, setTargetEdit] = useState<Etiquetas | null>(null);
  const [targetDelete, setTargetDelete] = useState<Etiquetas | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "",
  });
  const [filtro, setFilter] = useState<any>(null);

  useImperativeHandle(ref, () => ({
    CreateElement,
  }));

  const headCells: any[] = [
    { id: "NombreLower", alignment: "left", label: "Nombre" },
    { id: "Rubro.Nombre", alignment: "left", label: "Rubro" },
    { id: "Rango", alignment: "left", label: "Rango" },
    { id: "Posicion", alignment: "center", label: "Posición Fenológica" },
    { id: "Acciones", alignment: "center", label: "Acciones" },
  ];

  const {
    get: { data: etiquetas, error, isLoading, count },
    handleReload,
    handleLoadData,
    handleLoadMoreData,
  } = newUseFirebaseData({
    filter: filtro,
    getData: (rowsPerPage: any, orderBy, orderDirection, filter) =>
      GetEtiquetas(rubroId, rowsPerPage, orderBy, orderDirection, filter),
    getDocsCount: () => GetCountEtiquetas(rubroId),
    getDocsCountFiltered: (orderBy, orderDirection, filter) =>
      GetCountEtiquetas(rubroId, orderBy, orderDirection, filter),
    getMoreData: (lastDoc, rowsPerPage, orderBy, orderDirection, filter) =>
      GetMoreEtiquetas(
        rubroId,
        lastDoc,
        rowsPerPage,
        orderBy,
        orderDirection,
        filter
      ),
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
    rows: etiquetas as any[],
    totalDocs: count,
    defaultOrderBy: "Posicion",
    defaultSortOrder: "asc",
    onRequestSort: handleLoadData,
    onChangePage: handleLoadMoreData,
    onChangeRowsPerPage: handleLoadData,
    onLoad: handleLoadData,
  });

  const handleCloseSnack = () => {
    setSnackState({ ...snackState, open: false });
  };

  const CreateElement = async (values: Etiquetas, file: File | null) => {
    setLoading(true);
    const res = await CreateEtiqueta(
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
      const res = await DeleteEtiqueta(id, rubroId);
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

  const handleOpenDelete = (selected: Etiquetas) => {
    setTargetDelete(selected);
    setOpenConfirm(true);
  };

  const handleOpenEdit = (selected: Etiquetas) => {
    setTargetEdit(selected);
    setOpenEdit(true);
  };

  const handleConfirmEdit = async (newData: Etiquetas) => {
    const oldRubroId: string = targetEdit?.Rubro.id || "";
    handleCloseEdit();
    setLoading(true);
    const file = newData.Foto instanceof File ? newData.Foto : null;
    const res = await UpdateEtiqueta(newData, file, oldRubroId);
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

  // const handleGoToSelected = (selected: any) => {
  //   router.replace(`/etiquetas/asjdhasjhdj`);
  // };

  const handleExport = async () => {
    const res = await GetAllEtiquetas(rubroId);
    const cleanedName = cleanString(rubroName || "").replaceAll(" ", "");

    if (typeof res !== "string") {
      if (res.length === 0) {
        setSnackState(openSnack("error", "No existen elementos"));
      } else {
        exportToCsv(
          `etiquetas_${cleanedName}.csv`,
          res,
          [
            "Nombre",
            "Posicion",
            "Descripcion",
            "Recomendacion",
            "Rango.max",
            "Rango.min",
            "FechaCreacion",
          ],
          [
            "Nombre",
            "Posicion",
            "Descripcion",
            "Recomendacion",
            "Rango Maximo",
            "Rango Minimo",
            "Fecha Creacion",
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
                      rowsSelected.length < etiquetas.length
                    }
                    checked={
                      etiquetas.length > 0 &&
                      rowsSelected.length === etiquetas.length
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
                    sortDirection={
                      orderBy === headCell.id && headCell.label !== "Rango"
                        ? order
                        : false
                    }
                  >
                    {headCell.id === "Acciones" ? (
                      headCell.id
                    ) : (
                      <TableSortLabel
                        // disabled={headCell.id === "Rango"}
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
                etiquetas
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
                        <TableCell align="left">
                          {row?.Rango && row?.Rango !== undefined
                            ? `[${row?.Rango.min}-${row?.Rango.max}]`
                            : "No definido"}
                        </TableCell>
                        <TableCell align="center">
                          {row?.Posicion || "No definida"}
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
      <NewEditEtiquetas
        title="Editar"
        open={openEdit}
        onClose={handleCloseEdit}
        onConfirm={handleConfirmEdit}
        selected={targetEdit}
        rubros={rubros}
      />
      <ConfirmDialog
        open={openConfirm}
        title="¿Desea eliminar esta etiqueta?"
        textContent="Se eliminara esta etiqueta"
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
  //
  const handleSearch = () => {
    const filter: any = {};
    if (nombre) filter["NombreLower"] = nombre;
    onSearch(filter);
  };

  return (
    <Paper sx={{ paddingTop: 4, paddingX: 5, backgroundColor: "#76a747" }}>
      <Grid container spacing={1} justifyContent="flex-start">
        <Grid item xs={3}>
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
      </Grid>
      <Divider mt={3} />
    </Paper>
  );
};

export default EtiquetasView;
