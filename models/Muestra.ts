import { Timestamp } from "firebase/firestore";
import { Etiquetas } from "./Etiquetas";

export interface Muestra {
  id?: string;
  rubroId?: string;
  FotoPath?: string;
  FotoUrl?: string;
  Campo?: { Nombre: string; Id: string };
  Sector?: { Nombre: string; Id: string };
  Etiqueta?: Etiquetas;
  EtiquetaFormula?: Etiquetas;
  EtiquetaFormulaInvalida?: boolean;
  FechaCreacion?: Timestamp;
  UltimaTemporada?: Timestamp | null;
  User?: { Nombre: string; Id: string; Apellido: string };
  Ubicacion?: { lat: number; lng: number };
  CalculoFormula?: number;
  GDA?: number;
  TablaCalculo?: {
    Fecha: string;
    GDA: number;
    GradosDias: number;
    TempBase: number;
    TempDia: string;
  }[];
}
