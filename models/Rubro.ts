import { Timestamp } from "firebase/firestore";

export interface Rubro {
  id?: string;
  Nombre: string;
  Descripcion: string;
  Variedades?: number;
  Etiquetas?: number;
  FechaCreacion: Timestamp;
  Foto?: { Url: string; Path: string } | File;
}
