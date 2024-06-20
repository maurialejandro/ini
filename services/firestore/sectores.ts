import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  limit,
  orderBy,
  Query,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firestore } from "../../configs/firebase-client";
import { Sector } from "../../models/Sector";
import { cleanString } from "../../utils/utils";
import { querySorter } from "./utils";

const storage = getStorage();

const orderFiltered = (
  order: string,
  sortOrder: "asc" | "desc"
): QueryConstraint => {
  if (order === "Nombre") return orderBy(order);
  // else if (order === "NombreLower") return orderBy(order);
  return orderBy(order, sortOrder);
};

export const GetCountSectores = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<number> => {
  try {
    if (
      // filter &&
      // filter !== undefined &&
      // Object.keys(filter).length !== 0 &&
      true
    ) {
      const collectionRef = collection(firestore, "Sectores");
      let order = sortBy;
      // if (filter && "FechaCreacion" in filter) {
      //   order = "FechaCreacion";
      // }
      let q: Query<DocumentData> = query(
        collectionRef,
        orderFiltered(order, sortOrder)
      );

      if (filter && filter !== undefined && Object.keys(filter).length > 0) {
        q = querySorter(q, filter);
      }
      const docsSnap = await getDocs(q);
      return docsSnap.docs.length;
    } else {
      const ref = doc(firestore, "Contadores", "Rubros");
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

export const GetAllSectores = async (
  campoId: string,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Sector[] | string> => {
  try {
    const collectionRef = collection(firestore, "Sectores");
    let order = sortBy;

    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(order, sortOrder),
      where("CampoId", "==", campoId)
    );

    const docsSnap = await getDocs(q);

    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    console.log(error);
    return "error";
  }
};
export const GetTottalyAllSectores = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Sector[] | string> => {
  try {
    const collectionRef = collection(firestore, "Sectores");
    let order = sortBy;

    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(order, sortOrder)
    );

    const docsSnap = await getDocs(q);

    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

export const GetSectores = async (
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Sector[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Sectores");
    let order = sortBy;

    let q: Query<DocumentData> = query(
      collectionRef,
      orderFiltered(order, sortOrder),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
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

export const GetSectores2 = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Sector[]> => {
  try {
    const q = query(
      collection(firestore, "Sectores"),
      orderBy(sortBy, sortOrder)
    );

    return (await getDocs(q)).docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const GetMoreSectores = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Sector[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Sectores");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      startAfter(latestDoc),
      limit(rowsPerPage)
    );

    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
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

export const UpdateSector = async (
  data: Sector
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Sectores", data.id || "");
    const newData = {
      ...data,
      NombreLower: cleanString(data.Nombre),
    };
    delete newData.id;

    await updateDoc(docRef, newData);

    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

export const AddSectorMuestras = async (
  data: {
    MuestraId: string;
    FechaMuestra: Timestamp;
    PosicionObservada: number;
    PosicionCalculada: number;
  },
  sectorId: string
): Promise<"Ok" | "Error"> => {
  try {
    const muestraId = data.MuestraId;
    const docRef = doc(firestore, "Sectores", sectorId, "Muestras", muestraId);

    await setDoc(docRef, data);

    return "Ok";
  } catch (error) {
    console.log(error);
    return "Error";
  }
};
export const GetSectorMuestras = async (
  fechaMuestra: Timestamp,
  sectorId: string,
  ultimaTemporada?: Timestamp | null
): Promise<
  | {
      id?: string;
      MuestraId: string;
      FechaMuestra: Timestamp;
      PosicionObservada: number;
      PosicionCalculada: number;
    }[]
  | string
> => {
  try {
    let q = query(
      collection(firestore, "Sectores", sectorId, "Muestras"),
      orderBy("FechaMuestra"),
      where("FechaMuestra", "<=", fechaMuestra)
    );

    if (ultimaTemporada) {
      q = query(q, where("FechaMuestra", ">=", ultimaTemporada));
    }

    const docsSnap = await getDocs(q);

    const data: any[] = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return data;
  } catch (error) {
    console.log(error);
    return "Error";
  }
};

export const DeleteSector = async (
  id: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Sectores", id);

    await deleteDoc(docRef);
    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};
