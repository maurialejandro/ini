import { Timestamp } from "firebase/firestore";

export interface Variedades {
  id?: string;
  Nombre: string;
  Descripcion: string;
  FechaCreacion: Timestamp;
  Foto?: { Url: string; Path: string } | File;
  Rubro: { id: string; Nombre: string };
  Coef1?: number;
  Coef2?: number;
  Coef3?: number;
  Coef4?: number;
  Coef5?: number;
  Coef6?: number;
}
