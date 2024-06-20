import {
  Alert,
  Grid,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Link as MuiLink,
  Snackbar,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import styled from "styled-components/macro";
// import { useAuth } from "../../../components/context/AuthProvider";
import Dashboard from "../../../components/layouts/Dashboard";
import { ProveedorForm } from "../crear";

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Divider = styled(MuiDivider)(spacing);

const ProveedorView = () => {
  const router = useRouter();
  // const { userData: userBD, user } = useAuth();
  const { id } = router.query;

  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "¡Actualizado!",
  });

  const handleCloseSnack = () => setSnackState({ ...snackState, open: false });

  return (
    <Dashboard>
      <Helmet title="Proveedor" />
      <Grid justifyContent="space-between" container spacing={6}>
        <Grid item>
          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link href="/proveedores" passHref>
              <MuiLink href="/proveedores">Proveedores</MuiLink>
            </Link>
            <Typography>{id ? "Editar" : ""}</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Divider my={5} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          {id && <ProveedorForm id={id as any} />}
        </Grid>
      </Grid>
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
    </Dashboard>
  );
};

export default ProveedorView;
