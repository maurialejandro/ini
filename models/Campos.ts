export interface Campos {
  id: string;
  User: {
    Id: string;
    Nombre: string;
    Apellido: string;
    NombreApellido_lower: string;
  };
  Nombre: string;
  Direccion: string;
  Region: { id: string; Nombre: string; Acronimo?: string };
  Comuna: { id: string; Nombre: string; Acronimo?: string };
}
