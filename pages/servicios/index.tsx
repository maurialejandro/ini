import {
  Breadcrumbs as MuiBreadcrumbs,
  Checkbox,
  Divider as MuiDivider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import styled from "styled-components/macro";
import React from "react";
import { Helmet } from "react-helmet-async";
import Dashboard from "../../components/layouts/Dashboard";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const Servicios = () => {
  return (
    <Dashboard>
      <Helmet title="Servicios" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Typography variant="h3" gutterBottom>
            Servicios
          </Typography>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Typography>Servicios</Typography>
          </Breadcrumbs>
        </Grid>

        <Grid item>{/* <Actions /> */}</Grid>
      </Grid>
      <Divider my={5} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <TableServicio />
        </Grid>
      </Grid>
    </Dashboard>
  );
};

const TableServicio = () => {
  const headCells: any[] = [
    { id: "Nombre", alignment: "left", label: "Nombre" },
    { id: "Apellido", alignment: "left", label: "Apellido" },
    { id: "Rut", alignment: "left", label: "Rut" },
  ];

  return (
    <Paper
      sx={{
        width: "100%",
        overflowX: "auto",
        height: "62vh",
      }}
    >
      <TableContainer>
        <Table
          aria-labelledby="tablaServicios"
          size={"medium"}
          aria-label="tabla usuarios"
        >
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                {/* <Checkbox
                  indeterminate={
                    rowsSelected.length > 0 &&
                    rowsSelected.length < usuarios.length
                  }
                  checked={
                    usuarios.length > 0 &&
                    rowsSelected.length === usuarios.length
                  }
                  onChange={handleSelectAllClick}
                  inputProps={{ "aria-label": "select all" }}
                /> */}
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.alignment as any}
                  padding={headCell.disablePadding ? "none" : "normal"}
                  // sortDirection={orderBy === headCell.id ? order : false}
                >
                  <TableSortLabel
                  // active={orderBy === headCell.id}
                  // direction={orderBy === headCell.id ? order : "asc"}
                  // onClick={() => {
                  //   handleRequestSort(headCell.id);
                  // }}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[]
              // .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                // const isItemSelected = isSelected(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    // aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={`${index}`}
                    // selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      {/* <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                        onClick={(event) => handleClickSelect(event, row.id)}
                      /> */}
                    </TableCell>

                    <TableCell align="left">{""}</TableCell>
                    <TableCell align="left">{""}</TableCell>
                    <TableCell align="left" sx={{ whiteSpace: "nowrap" }}>
                      {""}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Servicios;
