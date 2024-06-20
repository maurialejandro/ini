import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React from "react";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  textContent?: string;
}

const ConfirmDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  title = "",
  textContent,
}) => {
  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        {textContent && (
          <DialogContent>
            <DialogContentText>{textContent}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm}>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmDialog;
