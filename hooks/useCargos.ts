import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import {
  createCharge,
  getCharge,
  updateCharge,
} from "../services/firestore/cargos";
import { Cargo } from "../models/Cargo";

export interface Props {
  id?: string;
}

export const useCargos = ({ id }: Props) => {
  const [loading, setLoading] = useState(false);
  const [snackState, setSnackState] = useState({
    open: false,
    severity: "success" as "success" | "error" | "warning",
    message: "¡Actualizado!",
  });

  const handleCloseSnack = () => setSnackState({ ...snackState, open: false });

  const handleSnack = (s: "ok" | "error") => {
    let success = id ? "Actualizado con exito" : "Creado con éxito";
    let error = id ? "No se ha podido actualizar" : "No se ha podido crear";
    setSnackState({
      open: true,
      severity: s == "ok" ? "success" : "error",
      message: s == "ok" ? success : error,
    });
  };

  const onSubmit = async (v: any) => {
    setLoading(true);
    let s: "ok" | "error" = "ok";
    if (id) {
      s = await updateCharge(v, id);
    } else {
      s = await createCharge(v);
    }
    setLoading(false);
    handleSnack(s);
  };

  const {
    values,
    handleSubmit,
    errors,
    touched,
    handleBlur,
    setValues,
    setFieldValue,
  } = useFormik({
    initialValues: {
      Nombre: "",
      Campos: false,
      Muestras: false,
      Resultados: false,
    } as Cargo,
    onSubmit: (v) => onSubmit(v),
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
    }),
  });

  const loadForm = async (prov: string) => {
    const data = await getCharge(prov);
    console.log("loading cargo");
    if (typeof data !== "string") {
      const v = (({ FechaCreacion, ...obj }) => obj)(data);
      setValues(v);
    }
  };

  useEffect(() => {
    if (id) loadForm(id);
  }, [id]);

  return {
    values,
    errors,
    touched,
    handleBlur,
    setValue: setFieldValue,
    handleSubmit,
    loading,
    snackState,
    handleCloseSnack,
  };
};
