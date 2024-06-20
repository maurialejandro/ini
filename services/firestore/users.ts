import axios from "axios";
import { AxiosResponse } from "axios";
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
  startAt,
  endAt,
  Query,
  DocumentData,
  QueryDocumentSnapshot,
  startAfter,
  QueryConstraint,
} from "firebase/firestore";
import { firestore } from "../../configs/firebase-client";
import { Users } from "../../models/Users";
import { ApiOut } from "../../utils/api";
import { auth } from "../../configs/firebase-client";
import { checkAuthCredentials } from "../auth/index";
import { querySorter } from "./utils";

const orderFiltered = (
  order: string,
  sortOrder: "asc" | "desc"
): QueryConstraint => {
  if (order === "FechaCreacion") return orderBy(order);
  else if (order === "NombreLower") return orderBy(order);
  return orderBy(order, sortOrder);
};

export const GetCountUsuarios = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<number> => {
  try {
    if (
      // filter &&
      // filter !== undefined &&
      // Object.keys(filter).length > 0 &&
      // Object.keys(filter).length !== 0
      true
    ) {
      const collectionRef = collection(firestore, "Usuarios");
      let q: Query<DocumentData> = query(
        collectionRef,
        orderBy(sortBy, sortOrder)
      );

      if (filter && filter !== undefined && Object.keys(filter).length > 0) {
        q = querySorter(q, filter);
      }

      const docsSnap = await getDocs(q);
      const filteredDocs = docsSnap.docs.filter(
        (doc) => doc.data()?.Permisos !== "Administrador"
      );
      return filteredDocs.length;
    } else {
      const ref = doc(firestore, "Contadores", "Usuarios");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return snap.data()?.count || 0;
      } else {
        return 0;
      }
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const GetUsuarios = async (
  rowsPerPage: number = 10,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Users[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Usuarios");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(sortBy, sortOrder),
      // where("Permisos", "==", "Usuario"),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length > 0) {
      console.log(filter);

      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const lastDoc = docsSnap.docs[docsSnap.docs.length - 1];
    const filteredDocs = docsSnap.docs.filter(
      (doc) => doc.data()?.Permisos !== "Administrador"
      // (doc) => true
    );
    const data: any[] = filteredDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data, lastDoc };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetAllUsers = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Users[] | string> => {
  try {
    const collectionRef = collection(firestore, "Usuarios");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(sortBy, sortOrder)
    );

    const docsSnap = await getDocs(q);

    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const filteredData = data.filter(
      (doc) => doc?.Permisos !== "Administrador"
    );

    return filteredData;
  } catch (error) {
    console.log(error);
    // throw error;
    return "error";
  }
};

export const GetMoreUsuarios = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Users[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Usuarios");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(sortBy, sortOrder),
      // where("Permisos", "==", "Usuario"),
      startAfter(latestDoc),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length > 0) {
      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const lastDoc = docsSnap.docs[docsSnap.docs.length - 1];
    const filteredDocs = docsSnap.docs.filter(
      (doc) => doc.data()?.Permisos !== "Administrador"
    );
    const data: any[] = filteredDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data, lastDoc };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllUsers = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  max: number = 10
): Promise<Users[]> => {
  try {
    const usersRef = collection(firestore, "Usuarios");
    const usersQuery = query(usersRef, orderBy(sortBy, sortOrder), limit(max));
    return (await getDocs(usersQuery)).docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    })) as Users[];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOneUser = async (id: string): Promise<any> => {
  try {
    const docRef = doc(firestore, "Usuarios", id);
    const docData = await getDoc(docRef);
    return {
      id: docData.data()?.Rut,
      Nombre: docData.data()?.Nombre,
      Email: docData.data()?.Email,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteUser = async (target: any): Promise<any> => {
  try {
    const userId: string = target?.id;

    const response: AxiosResponse<ApiOut> = await axios.delete("/api/auth", {
      data: { userId },
      headers: { token: (await auth.currentUser?.getIdToken()) as string },
    });
    const userRef = doc(firestore, "Usuarios", userId);
    await deleteDoc(userRef);
    const useRef = collection(firestore, "Campos");
    const queryCampos = query(useRef, where("User.Id", "==", target?.id));
    const dataCampo = await getDocs(queryCampos);
    if (dataCampo.docs.length >= 1) {
      console.log("tiene y hay que eliminar");
      dataCampo.forEach((doc) => {
        console.log(doc.data());
        deleteDoc(doc.ref);
      });
    }
    return { ...response.data };
  } catch (error: any) {
    return { wasCorrect: false, payload: error.message };
  }
};

export const updateUser = async (
  user: Object,
  emailForm: String,
  emailAuth: String | undefined
) => {
  try {
    const data: any = user;
    const userId = data?.id;
    const userEmail = data?.Email;

    const userData = {
      uid: data.uid,
      Email: userEmail,
    };

    if (emailForm !== emailAuth) {
      const usuarioRef = collection(firestore, "Usuarios");
      const queryEmail = query(usuarioRef, where("Email", "==", userEmail));
      const docData = await getDocs(queryEmail);
      if (docData.size === 1) {
        return "email-coincide";
      } else {
        const checkCredentials = await checkAuthCredentials(userData);
        if (checkCredentials === "email-coincide") {
          return "email-coincide";
        } else {
          await updateDoc(doc(firestore, "Usuarios", userId), data);
          return "OK";
        }
      }
    } else {
      await updateDoc(doc(firestore, "Usuarios", userId), data);
      return "OK";
    }
    return "no-validate";
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const searchUser = async (search: string) => {
  try {
    const usersRef = collection(firestore, "Usuarios");
    const usersQuery = query(
      usersRef,
      orderBy("NombreLower"),
      startAt(search),
      endAt(search + "\uf8ff")
    );
    return (await getDocs(usersQuery)).docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log(error);
  }
};

export const filterPermissions = async (filter: string) => {
  try {
    const usersRef = collection(firestore, "Usuarios");
    const usersQuery = query(usersRef, where("Permisos", "==", filter));
    return (await getDocs(usersQuery)).docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const filterDate = async (date: any) => {
  try {
    const usersRef = collection(firestore, "Usuarios");
    const usersQuery = query(
      usersRef,
      where("FechaCreacion", ">", date[0]),
      where("FechaCreacion", "<", date[1])
    );
    return (await getDocs(usersQuery)).docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
};
