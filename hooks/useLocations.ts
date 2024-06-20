import { useEffect, useState } from "react";
import { GetCampos } from "../services/firestore/campos";
import { Regiones } from "../models/Regiones";
import { getAllRegiones, getComunas } from "../services/firestore/regiones";

export interface Props {}

export const useLocations = ({}: Props) => {
  const [regiones, setRegiones] = useState<Regiones[]>([]);
  const [comunas, setComunas] = useState<{ Nombre: string; id: string }[]>([]);

  const loadRegiones = async () => {
    const data = await getAllRegiones();
    setRegiones(data);
  };

  const loadComunas = async (id: string) => {
    const data = await getComunas(id);
    setComunas(data);
  };

  useEffect(() => {
    loadRegiones();
  }, []);

  return {
    regiones,
    comunas,
    loadRegiones,
    loadComunas,
  };
};
