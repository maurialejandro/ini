import { Timestamp } from "firebase/firestore";
import { Regiones } from "./Regiones";

export type Cargo = {
  id: string;
  Nombre: string;
  Campos: boolean;
  Muestras: boolean;
  Resultados: boolean;
  FechaCreacion?: Timestamp
};
