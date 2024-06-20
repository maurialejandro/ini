import { createContext, FC, useContext, useState } from "react";
import { Regiones } from "../../models/Regiones";

interface RegionesContext {
  region: Regiones | null | undefined;
}

const initialSate = {
  region: undefined,
};

const RegionesContext = createContext<RegionesContext>(initialSate);

export const RegionesProvider: FC = ({ children }) => {
  const [region, setRegion] = useState<Regiones | null | undefined>();

  return (
    <RegionesContext.Provider value={{ region }}>
      {children}
    </RegionesContext.Provider>
  );
};

export const useRegiones = () => useContext(RegionesContext);