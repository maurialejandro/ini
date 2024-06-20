import { Timestamp } from "firebase/firestore";

export interface Users {
    Nombre: string;
    Apellido: string;
    Creado_en: Timestamp;
    Rut: string;
    Email: string;
    Telefono: number;
    Region: { id: string; Nombre: string };
    Comuna: { id: string; Nombre: string };
}