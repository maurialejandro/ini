import { Timestamp } from "firebase/firestore";
import { Regiones } from "./Regiones";

export type Proveedor = {
  id: string;
  Nombre: string;
  Direccion: string;
  Region: Regiones;
  Comuna: { id: string; Nombre: string };
  Telefono: number;
  Email: string;
  Web: string;
  Imagen: FileData_;
  FechaCreacion?: Timestamp
};

export type FileData_ = {
  url: string;
  name?: string;
  path: string;
  file?: File;
};
