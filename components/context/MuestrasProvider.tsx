import { createContext, Dispatch, useContext, useState } from "react";
import { Muestra } from "../../models/Muestra";

interface MuestraContext {
  muestra: Muestra | null;
  updateMuestra: Dispatch<any>;
}

const MuestrasContext = createContext<MuestraContext | null>(null);

export const MuestrasProvider = (props: any) => {
  const [muestra, setMuestra] = useState<Muestra | null>(null);

  const updateMuestra = (muestra: Muestra | null) => {
    setMuestra(muestra);
  };

  return (
    <MuestrasContext.Provider
      value={{
        muestra,
        updateMuestra,
      }}
    >
      {props.children}
    </MuestrasContext.Provider>
  );
};

export const useMuestra = () => useContext(MuestrasContext);
