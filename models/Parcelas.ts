import { UserParcela } from "./UserParcela";

export interface Parcelas {
  id: string;
  Nombre: string;
  Propietario: {
    id: string;
    Nombre: string;
  };
  Condominio: {
    id: string;
    Nombre: string;
  };
  Usuario?: UserParcela;
}
