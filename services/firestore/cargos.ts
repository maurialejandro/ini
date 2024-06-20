import {
  DocumentData,
  Query,
  QueryDocumentSnapshot,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { firestore } from "../../configs/firebase-client";
import { editCount, querySorter } from "./utils";
import { Cargo } from "../../models/Cargo";

const storage = getStorage();

const REFERENCE = collection(firestore, "Cargos");

const updateCount = async (type: "plus" | "minus") => {
  const reference = doc(firestore, "Contadores", "Cargos");
  await editCount(reference, "count", type);
};

export const createCharge = async (
  data: Cargo
): Promise<"ok" | "error"> => {
  try {
    const { ...form } = data;

    // const { file } = Imagen;

    const res = await addDoc(REFERENCE, {
      ...form,
      FechaCreacion: serverTimestamp(),
    });

    // if (file) {
    //   const path = `Cargos/${res.id}/imagen`;
    //   const fileRef = ref(storage, path);
    //   const ss = await uploadBytes(fileRef, file);
    //   const url = await getDownloadURL(ss.ref);
    //   await updateDoc(res, { Imagen: { url, path } });
    // }

    await updateCount("plus");

    return "ok";
  } catch (error) {
    console.log(error);
    // throw(error);
    return "error";
  }
};

export const updateCharge = async (
  data: Cargo,
  id: string
): Promise<"ok" | "error"> => {
  try {
    const { ...form } = data;

    // const { file } = Imagen;

    const reference = doc(firestore, "Cargos", id);

    await updateDoc(reference, form);

    // if (file) {
    //   const path = `Proveedores/${id}/imagen`;
    //   const fileRef = ref(storage, path);
    //   const ss = await uploadBytes(fileRef, file);
    //   const url = await getDownloadURL(ss.ref);
    //   await updateDoc(reference, { Imagen: { url, path } });
    // }

    return "ok";
  } catch (error) {
    console.log(error);
    // throw(error);
    return "error";
  }
};

export const getCharge = async (id: string): Promise<Cargo | "error"> => {
  try {
    const ref = doc(firestore, "Cargos", id);
    const res = await getDoc(ref);
    return { id: id, ...res.data() } as any;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

export const deleteCharge = async (target: Cargo): Promise<any> => {
  try {
    let id: string = target.id;
    const campoRef = doc(firestore, "Cargos", id);
    // if (target.Imagen) {
    //   const fileRef = ref(storage, target.Imagen.path);
    //   await deleteObject(fileRef);
    // }
    await deleteDoc(campoRef);
    await updateCount("minus");
    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getCharges = async (
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Cargo[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const max = filter ? 999 : rowsPerPage;

    let q: Query<DocumentData> = query(
      REFERENCE,
      orderBy(sortBy, sortOrder),
      limit(max)
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

export const getExportCharges = async (
  filter?: any
): Promise<Cargo[]> => {
  try {
    let q: Query<DocumentData> = query(REFERENCE, orderBy("Nombre", "desc"));

    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const data = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Cargo[];

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getMoreCharges = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Cargo[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    let q: Query<DocumentData> = query(
      REFERENCE,
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

export const getCountCharges = async (): Promise<number> => {
  try {
    const ref = doc(firestore, "Contadores", "Cargos");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      return snap.data()?.count || 0;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
};
