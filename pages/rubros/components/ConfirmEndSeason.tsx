import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import React, { useEffect, useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmEndSeason: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [enableConfirm, setEnableConfirm] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEnableConfirm(e.target.checked);
  const label = { inputProps: { "aria-label": "Checkbox demo" } };

  useEffect(() => {
    if (!open) {
      setEnableConfirm(false);
    }
  }, [open]);

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">
          Confirmar Finalización de Termporada Actual.
        </DialogTitle>
        <DialogContent dividers={true}>
          <Box mt={5}>
            <DialogContentText id="scroll-dialog-description">
              {`Esta acción definirá como terminada la temporada actual para todos los sectores relacionados a este Rubro. 
            Se generará nuevo registro de muestras. Las nuevas muestras generadas recopilarán nuevos datos a partir de esta fecha.`}
            </DialogContentText>
          </Box>
          <Box display="flex" justifyContent="flex-end" mt={5}>
            <Box mt={3}>
              <Typography>
                Confirmo acción de dar término a la actual temporada.
              </Typography>
            </Box>
            <Checkbox
              value={enableConfirm}
              onChange={handleChange}
              {...label}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={!enableConfirm}>
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmEndSeason;
