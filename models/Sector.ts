import { Timestamp } from "firebase/firestore";

export interface Sector {
  id?: string;
  Nombre: string;
  Variedad?: { Nombre: string; id: string };
  Rubro?: { Nombre: string; id: string };
  Campo?: { Nombre: string; id: string };
  CampoId?: string;
  FechaCreacion?: Timestamp;
  User?: { Nombre: string; Id: string; Apellido: string };
}
