export interface Condominios {
  id: string;
  Nombre: string;
  Manager?: {
    id: string;
    Nombre: string;
  };
  Parcelas?: number;
}
