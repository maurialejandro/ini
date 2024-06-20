import { createContext, Dispatch, useContext, useState } from "react";

interface RubroContext {
  nombre: string;
  setNombre: Dispatch<any>;
}

const RubrosContext = createContext<RubroContext | null>(null);

export const RubrosProvider = (props: any) => {
  const [nombre, setNombre] = useState<string>("");

  return (
    <RubrosContext.Provider
      value={{
        nombre,
        setNombre,
      }}
    >
      {props.children}
    </RubrosContext.Provider>
  );
};

export const useRubro = () => useContext(RubrosContext);
