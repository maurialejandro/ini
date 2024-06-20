import Axios from "axios";
import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  where,
  getDoc,
  getDocs,
  deleteDoc,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { firestore } from "../../configs/firebase-client";
import { Parcelas } from "../../models/Parcelas";
import { UserParcela } from "../../models/UserParcela";

export const getAllParcelas = async (
  user?: string | null,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  max: number = 10
): Promise<Parcelas[]> => {
  try {
    const parcelaRef = collection(firestore, "Parcelas");
    if (user) {
      const q = query(
        parcelaRef,
        where("Propietario.id", "==", user),
        orderBy(sortBy, sortOrder),
        limit(max)
      );
      return (await getDocs(q)).docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else {
      const q = query(parcelaRef, orderBy(sortBy, sortOrder), limit(max));
      return (await getDocs(q)).docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOneParcela = async (id: string): Promise<Parcelas> => {
  try {
    const docRef = doc(firestore, "Parcelas", id);
    const docData = await getDoc(docRef);

    return {
      Nombre: docData.data()?.Nombre,
      Propietario: docData.data()?.Propietario,
      Condominio: docData.data()?.Condominio,
      id: id,
      Usuario: docData.data()?.Usuario,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createParcela = async (
  dataParcela: Parcelas
): Promise<Parcelas> => {
  try {
    const parcela: any = dataParcela;
    delete parcela.id;
    const res = await addDoc(collection(firestore, "Parcelas"), parcela);
    await updateDoc(doc(firestore, "Condominios", dataParcela.Condominio.id), {
      Parcelas: increment(1),
    });
    return { ...parcela, id: res.id };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateParcelaName = async (
  name: string,
  id: string
): Promise<any> => {
  try {
    const parcelaRef = doc(firestore, "Parcelas", id);
    await updateDoc(parcelaRef, {
      Nombre: name,
    });

    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteParcela = async (target: Parcelas): Promise<any> => {
  try {
    const parcelaRef = doc(firestore, "Parcelas", target.id);

    if (target.Usuario?.id) {
      await deleteDoc(doc(firestore, "Usuarios", target.Usuario?.id));
      // EXECUTE CLOUD FUNCTION DELETE USER AUTHENTICATION
    }
    await deleteDoc(parcelaRef);
    await updateDoc(doc(firestore, "Condominios", target.Condominio.id), {
      Parcelas: increment(-1),
    });
    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createUserParcela = async (
  user: UserParcela,
  parcelaId: string,
  oldUser?: string
) => {
  try {
    if (oldUser) {
      // ACTION DELETE OLD USER FROM AUTHENTICATION
      await Axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          idToken: oldUser,
          returnSecureToken: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    const authResponse = await Axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        email: user.Email,
        password: user.Password,
        returnSecureToken: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    // const authResponse = await createUserWithEmailAndPassword(
    //   auth,
    //   user.Email,
    //   user.Password
    // );
    const ID = authResponse.data.localId;
    const data: any = user;

    delete data.id;

    const parcelaRef = doc(firestore, "Parcelas", parcelaId);

    await setDoc(doc(firestore, "Usuarios", ID), {
      ...data,
      Permisos: "Usuario",
    });
    await updateDoc(parcelaRef, { Usuario: { ...data, id: ID } });

    return { ...data, id: ID };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateUserParcela = async (
  user: UserParcela,
  userId: string,
  parcelaId: string
) => {
  try {
    const data: any = user;
    delete data.id;

    const parcelaRef = doc(firestore, "Parcelas", parcelaId);

    await updateDoc(doc(firestore, "Usuarios", userId), data);
    await updateDoc(parcelaRef, { Usuario: { ...user, id: userId } });

    return { ...user, id: userId };
  } catch (error) {
    console.log(error);
    return null;
  }
};

type Callback = (user: User | null) => void;

export const validateSesion = (callback: Callback) => {
  //   listener = auth.onAuthStateChanged(callback, console.error);
};
