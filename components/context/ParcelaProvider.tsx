import { createContext, FC, useContext, useState } from "react";
import { Parcelas } from "../../models/Parcelas";

interface ParcelaContext {
  parcela: Parcelas | null | undefined;
}

const initialSate = {
  parcela: undefined,
};

const ParcelasContext = createContext<ParcelaContext>(initialSate);

export const ParcelaProvider: FC = ({ children }) => {
  const [parcela, setParcela] = useState<Parcelas | null | undefined>();

  return (
    <ParcelasContext.Provider value={{ parcela }}>
      {children}
    </ParcelasContext.Provider>
  );
};

export const useParcela = () => useContext(ParcelasContext);
