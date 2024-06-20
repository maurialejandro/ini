import { createContext, FC, useContext, useState } from "react";
import { Users } from "../../models/Users";

interface UsersContext {
    user: Users | null | undefined;
}

const initialSate = {
    user: undefined,
}

const UsersContext = createContext<UsersContext>(initialSate);

export const UsuariosProvider: FC = ({ children }) => {
    const [ user, setUser ] = useState<Users | null | undefined>();

    return (
        <UsersContext.Provider value={{ user }}>
            {children}
        </UsersContext.Provider>
    )
};

export const useUsers = () => useContext(UsersContext);

