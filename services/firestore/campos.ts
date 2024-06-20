import { User } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  QueryDocumentSnapshot,
  startAfter,
  startAt,
  updateDoc,
} from "firebase/firestore";

import { firestore } from "../../configs/firebase-client";
import { Campos } from "../../models/Campos";
import { querySorter } from "./utils";

export const GetCountCampos = async (
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
      const collectionRef = collection(firestore, "Campos");
      let q: Query<DocumentData> = query(
        collectionRef,
        orderBy(sortBy, sortOrder)
      );

      if (filter && filter !== undefined && Object.keys(filter).length > 0) {
        q = querySorter(q, filter);
      }

      console.log("aqui");
      const docsSnap = await getDocs(q);
      return docsSnap.docs.length;
    } else {
      console.log("qaui");

      const ref = doc(firestore, "Contadores", "Campos");
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

export const GetCampos = async (
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Campos[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Campos");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length > 0) {
      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const lastDoc = docsSnap.docs[docsSnap.docs.length - 1];
    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data, lastDoc };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetAllCampos = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Campos[] | string> => {
  try {
    const collectionRef = collection(firestore, "Campos");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder)
    );

    const docsSnap = await getDocs(q);

    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    console.log(error);
    // throw error;
    return "error";
  }
};

export const GetMoreCampos = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Campos[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Campos");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      startAfter(latestDoc),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length > 0) {
      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const lastDoc = docsSnap.docs[docsSnap.docs.length - 1];
    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { data, lastDoc };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllCampos = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  max: number = 10
): Promise<Campos[]> => {
  try {
    const camposRef = collection(firestore, "Campos");
    const q = query(camposRef, orderBy(sortBy, sortOrder), limit(max));

    return (await getDocs(q)).docs.map((doc: any) => ({
      id: doc.id,
      Nombre: doc.data().Nombre,
      Direccion: doc.data().Direccion,
      Region: doc.data().Region,
      Comuna: doc.data().Comuna,
    })) as Campos[];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getOneCampo = async (id: string): Promise<Campos> => {
  try {
    const docRef = doc(firestore, "Campos", id);
    const docData = await getDoc(docRef);

    return {
      id: id,
      Nombre: docData.data()?.Nombre,
      Direccion: docData.data()?.Direccion,
      Region: docData.data()?.Region,
      Comuna: docData.data()?.Comuna,
      User: docData.data()?.User?.Nombre,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteCampo = async (target: Campos): Promise<any> => {
  try {
    let campoId: string = target.id!;
    const campoRef = doc(firestore, "Campos", campoId);
    await deleteDoc(campoRef);
    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCampo = async (campo: Object) => {
  try {
    const data: any = campo;
    const campoId = data.id;
    const docRefUser = doc(firestore, "Usuarios", data?.idUsuario);
    const docDataUser = await getDoc(docRefUser);

    const dataCampo: any = {
      Nombre: data?.Nombre,
      Direccion: data?.Direccion,
      Comuna: {
        id: data?.Comuna?.id,
        Nombre: data?.Comuna?.Nombre,
      },
      Region: {
        id: data?.Region?.id,
        Nombre: data?.Region?.Nombre,
      },
      User: {
        Id: data?.idUsuario,
        Nombre: docDataUser.data()?.Nombre,
        Apellido: docDataUser.data()?.Apellido,
      },
    };

    if (dataCampo?.User?.Id) {
      await updateDoc(doc(firestore, "Campos", campoId), dataCampo);
      return "OK";
    } else {
      return "Error";
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const createCampo = async (data: Campos): Promise<Campos> => {
  try {
    const campo: any = data;
    delete campo.id;

    const docRefUser = doc(firestore, "Usuarios", campo?.UserId);
    const docDataUser = await getDoc(docRefUser);

    const dataCampo: any = {
      Nombre: campo?.Nombre,
      Direccion: campo?.Direccion,
      Comuna: {
        id: data?.Comuna?.id,
        Nombre: data?.Comuna?.Nombre,
      },
      Region: {
        id: data?.Region?.id,
        Nombre: data?.Region?.Nombre,
      },
      User: {
        Id: docDataUser.data()?.id,
        Nombre: docDataUser.data()?.Nombre,
        Apellido: docDataUser.data()?.Apellido,
      },
    };

    const res = await addDoc(collection(firestore, "Campos"), dataCampo);
    return { ...campo, id: res.id };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const searchCampo = async (search: any) => {
  try {
    const usersRef = collection(firestore, "Campos");
    const usersQuery = query(
      usersRef,
      orderBy("Nombre"),
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
type Callback = (user: User | null) => void;

export const validateSesion = (callback: Callback) => {
  //   listener = auth.onAuthStateChanged(callback, console.error);
};
