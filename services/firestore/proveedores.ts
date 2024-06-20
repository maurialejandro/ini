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
import { Proveedor } from "../../models/Proveedor";
import { editCount, querySorter } from "./utils";

const storage = getStorage();

const REFERENCE = collection(firestore, "Proveedores");

const updateCount = async (type: "plus" | "minus") => {
  const reference = doc(firestore, "Contadores", "Proveedores");
  await editCount(reference, "count", type);
};

export const createProvider = async (
  data: Proveedor
): Promise<"ok" | "error"> => {
  try {
    const { Imagen, ...form } = data;

    const { file } = Imagen;

    const res = await addDoc(REFERENCE, {
      ...form,
      FechaCreacion: serverTimestamp(),
    });

    if (file) {
      const path = `Proveedores/${res.id}/imagen`;
      const fileRef = ref(storage, path);
      const ss = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(ss.ref);
      await updateDoc(res, { Imagen: { url, path } });
    }

    await updateCount("plus");

    return "ok";
  } catch (error) {
    console.log(error);
    // throw(error);
    return "error";
  }
};

export const updateProvider = async (
  data: Proveedor,
  id: string
): Promise<"ok" | "error"> => {
  try {
    const { Imagen, ...form } = data;

    const { file } = Imagen;

    const reference = doc(firestore, "Proveedores", id);

    await updateDoc(reference, form);

    if (file) {
      const path = `Proveedores/${id}/imagen`;
      const fileRef = ref(storage, path);
      const ss = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(ss.ref);
      await updateDoc(reference, { Imagen: { url, path } });
    }

    return "ok";
  } catch (error) {
    console.log(error);
    // throw(error);
    return "error";
  }
};

export const getProvider = async (id: string): Promise<Proveedor | "error"> => {
  try {
    const ref = doc(firestore, "Proveedores", id);
    const res = await getDoc(ref);
    return { id: id, ...res.data() } as any;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

export const deleteProvider = async (target: Proveedor): Promise<any> => {
  try {
    let id: string = target.id;
    const campoRef = doc(firestore, "Proveedores", id);
    if (target.Imagen) {
      const fileRef = ref(storage, target.Imagen.path);
      await deleteObject(fileRef);
    }
    await deleteDoc(campoRef);
    await updateCount("minus");
    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getProviders = async (
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Proveedor[];
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

export const getExportProviders = async (
  filter?: any
): Promise<Proveedor[]> => {
  try {
    let q: Query<DocumentData> = query(REFERENCE, orderBy("Nombre", "desc"));

    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
      q = querySorter(q, filter);
    }

    const docsSnap = await getDocs(q);

    const data = docsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Proveedor[];

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getMoreProviders = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Proveedor[];
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

export const getCountProviders = async (): Promise<number> => {
  try {
    const ref = doc(firestore, "Contadores", "Proveedores");
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
