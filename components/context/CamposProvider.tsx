import { createContext, FC, useContext, useState } from "react";
import { Campos } from "../../models/Campos";

interface CamposContext {
  campo: Campos | null | undefined;
}

const initialSate = {
  campo: undefined,
};

const CamposContext = createContext<CamposContext>(initialSate);

export const CamposProvider: FC = ({ children }) => {
  const [campo, setCampo] = useState<Campos | null | undefined>();

  return (
    <CamposContext.Provider value={{ campo }}>
      {children}
    </CamposContext.Provider>
  );
};

export const useCampos = () => useContext(CamposContext);