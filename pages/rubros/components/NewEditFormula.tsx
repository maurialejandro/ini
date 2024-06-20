import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { withStyles } from "@mui/styles";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { Delete, FastForward } from "react-feather";
import * as yup from "yup";
import { formulaValidator, rubroFormulaReader } from "../../../utils/utils";

const CssTextField = withStyles({
  root: {
    "& input": {
      color: "#000",
      fontSize: 60,
    },
  },
})(TextField);

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (values: any) => void;
  selected?: any | null;
}

const NewEditFormula: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  selected,
}) => {
  const [isTested, setTested] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const [charsArr, setCharsArr] = useState<string[]>([]);
  const formInitial = {
    Formula: "",
    Nombre: "",
  };
  const {
    values,
    handleSubmit,
    handleChange,
    resetForm,
    setFieldValue,
    setValues,
    handleBlur,
    errors,
    touched,
  } = useFormik({
    initialValues: formInitial,
    onSubmit: (values) => {
      const minLength = values.Formula.length;
      if (isTested && minLength !== 0) {
        setTested(false);
        setShowErr(false);
        onConfirm({ Nombre: selected?.Nombre, Formula: values.Formula });
      } else {
        if (!isTested) setShowErr(true);
        if (minLength === 0) {
        }
      }
    },
    // onSubmit: (values) => {
    //   rubroFormulaReader(values.Formula, 2.5, 4, 20, 2, 44, 34);
    // },
    validationSchema: yup.object({
      Formula: yup.string().required("Fórmula es requerida"),
    }),
  });

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    if (selected && selected !== undefined) setValues({ ...selected } as any);
  }, [selected]);

  const addToFormula = (txt: string) => {
    const fastCopy = [...charsArr, txt];
    setCharsArr([...charsArr, txt]);
    let str = "";
    fastCopy.map((elem) => (str = str + elem));
    const Formula = formulaValidator(str);
    setFieldValue("Formula", Formula);
  };
  const removeFromFormula = () => {
    charsArr.pop();
    let str = "";
    charsArr.map((elem) => (str = str + elem));
    const Formula = formulaValidator(str);
    setFieldValue("Formula", Formula);
  };

  const handleTestFormula = () => {
    if (!values.Formula) return;
    const Formula = values.Formula;

    if (Formula.length === 0) return;
    console.log(Formula);

    rubroFormulaReader(
      Formula,
      getRandomInt(10),
      getRandomInt(15),
      getRandomInt(10),
      getRandomInt(20),
      getRandomInt(15),
      getRandomInt(30),
      getRandomInt(10)
    );
    setTested(true);
    setShowErr(false);
  };
  const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {(selected ? "Editar" : "Nueva") + " Fórmula " + selected?.Nombre}
          </DialogTitle>
          <DialogContent>
            <Grid container justifyContent="space-evenly" spacing={3}>
              <Grid item container xs={12} sm={7}>
                <Grid item xs={12} sm={12}>
                  <CssTextField
                    id="formula"
                    value={values.Formula}
                    variant="outlined"
                    autoComplete="off"
                    type="text"
                    multiline
                    rows={6}
                    fullWidth
                    inputProps={{ maxLength: 70, readOnly: true }}
                    InputProps={{ style: { fontSize: 18 } }}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.Formula && Boolean(errors.Formula)}
                    helperText={touched.Formula && errors.Formula}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    style={{ marginTop: 9 }}
                    fullWidth
                    onClick={handleTestFormula}
                    // startIcon={<FastForward />}
                  >
                    Probar Fórmula
                  </Button>
                  {showErr && (
                    <Typography variant="caption" color="red">
                      * Fórmula debe ser probada mínimo 1 vez.
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid
                item
                container
                xs={12}
                sm={5}
                spacing={1}
                style={{ height: 250 }}
              >
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[A]")}
                  >
                    Coeficiente A
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[B]")}
                  >
                    Coeficiente B
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[C]")}
                  >
                    Coeficiente C
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[D]")}
                  >
                    Coeficiente D
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[E]")}
                  >
                    Coeficiente E
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[F]")}
                  >
                    Coeficiente F
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[GDA]")}
                  >
                    GDA
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={() => addToFormula("[EXP]")}
                  >
                    Exp
                  </Button>
                </Grid>
                <Grid item xs={12} sm={4}></Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("*")}
                  >
                    *
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("/")}
                  >
                    /
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("**")}
                  >
                    ^
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("(")}
                  >
                    (
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula(")")}
                  >
                    )
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("+")}
                  >
                    +
                  </Button>
                </Grid>
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("-")}
                  >
                    -
                  </Button>
                </Grid>
                {/* <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    style={{ fontSize: 16 }}
                    onClick={() => addToFormula("^")}
                  >
                    ^
                  </Button>
                </Grid> */}
                <Grid item xs={6} sm={4}>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    onClick={removeFromFormula}
                  >
                    <Delete size={28} color="#fff" />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="submit">Aceptar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default NewEditFormula;
