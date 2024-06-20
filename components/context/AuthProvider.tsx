import { User } from "firebase/auth";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { auth } from "../../configs/firebase-client";
import nookies from "nookies";
import { Status } from "../../models/Status";
import { User as UserModel } from "../../models/User";
import { getUserFirestore, signOutSession } from "../../services/auth";

interface AuthContext {
  user: User | null | undefined;
  userData: UserModel | null | undefined;
  authStatus: Status;
}

const initialSate = {
  user: undefined,
  userData: undefined,
  authStatus: Status.Initial,
};

const AuthContext = createContext<AuthContext>(initialSate);

export const AuthProvider: FC = ({ children }) => {
  const [user, setUser] = useState<User | null | undefined>();
  const [userData, setUserData] = useState<UserModel | null | undefined>();
  const [authStatus, setAuthStatus] = useState<Status>(Status.Initial);

  useEffect(() => {
    setAuthStatus(Status.Submitting);
    return auth.onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        setUserData(null);
        nookies.set(undefined, "token", "");
        setAuthStatus(Status.Success);
        return;
      }
      const token = await user.getIdToken();
      setUser(user);
      const userDB: UserModel = await getUserFirestore(user.uid);
      setUserData(userDB);
      if (userDB?.Permisos !== "Administrador" ) {
        setUser(null);
        await signOutSession();
      }
      nookies.set(undefined, "token", token);
      setAuthStatus(Status.Success);
    });
  }, []);
  return (
    <AuthContext.Provider value={{ user, userData, authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
