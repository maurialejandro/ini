import { useFormik } from "formik";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { Proveedor } from "../models/Proveedor";
import {
  createProvider,
  getProvider,
  updateProvider,
} from "../services/firestore/proveedores";

export interface Props {
  id?: string;
}

export const useProveedores = ({ id }: Props) => {
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

  const onSubmit = async (v: Proveedor) => {
    setLoading(true);
    let s: "ok" | "error" = "ok";
    if (id) {
      s = await updateProvider(v, id);
    } else {
      s = await createProvider(v);
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
      Direccion: "",
      Region: null as any,
      Comuna: null as any,
      Telefono: "" as any,
      Email: "",
      Web: "",
      Imagen: "" as any,
    } as Proveedor,
    onSubmit: (v) => onSubmit(v),
    validationSchema: yup.object({
      Nombre: yup.string().required("Nombre requerido"),
      Direccion: yup.string().required("Dirección requerida"),
      Region: yup
        .object()
        .shape({ Nombre: yup.string().required("Region es requerida") }),
      Comuna: yup
        .object()
        .shape({ Nombre: yup.string().required("Comuna es requerida") }),
      Email: yup.string().email().required("Dirección requerida"),
      Web: yup.string().required("Dirección requerida"),
      Telefono: yup
        .number()
        .min(900000000, "Telefono no válido")
        .max(999999999, "Telefono no válido")
        .required("Telefono es requerido"),
      Imagen: yup
        .object()
        .shape({ url: yup.string().required("Region es requerida") }),
    }),
  });

  const loadForm = async (prov: string) => {
    const data = await getProvider(prov);
    console.log("loading provider");
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
