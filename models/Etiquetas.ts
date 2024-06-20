import { Timestamp } from "firebase/firestore";

export interface Etiquetas {
  id?: string;
  Nombre: string;
  Posicion?: number;
  Rango?: { min: number; max: number };
  Descripcion: string;
  Recomendacion?: string;
  FechaCreacion: Timestamp;
  Foto?: { Url: string; Path: string } | File;
  Rubro: { id: string; Nombre: string };
}
