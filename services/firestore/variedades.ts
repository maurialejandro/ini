import {
  addDoc,
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
  QueryDocumentSnapshot,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { firestore } from "../../configs/firebase-client";
import { Variedades } from "../../models/Variedades";
import { cleanString } from "../../utils/utils";
import { editCount, querySorter } from "./utils";

const storage = getStorage();

export const GetCountVariedades = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<number> => {
  try {
    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
      const collectionRef = collection(firestore, "Variedades");
      let q: Query<DocumentData> = query(
        collectionRef,
        orderBy(sortBy, sortOrder)
      );

      if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
        q = querySorter(q, filter);
      }

      const docsSnap = await getDocs(q);
      return docsSnap.docs.length;
    } else {
      const ref = doc(firestore, "Contadores", "Variedades");
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

export const GetVariedades = async (
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Variedades[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Variedades");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
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

export const GetAllVariedadesByRubro = async (
  rubroId: string,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Variedades[] | string> => {
  try {
    const collectionRef = collection(firestore, "Variedades");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      where("Rubro.id", "==", rubroId)
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
export const GetAllVariedades = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Variedades[] | string> => {
  try {
    const collectionRef = collection(firestore, "Variedades");
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

export const GetMoreVariedades = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Variedades[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Variedades");
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

export const CreateVariedad = async (
  data: Variedades,
  file: File | null
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const newData: any = {
      ...data,
      NombreLower: cleanString(data.Nombre),
      FechaCreacion: serverTimestamp(),
    };
    delete newData.id;
    const res = await addDoc(collection(firestore, "Variedades"), newData);
    const countRef = doc(firestore, "Contadores", "Variedades");
    await editCount(countRef, "count", "plus");
    const rubroRef = doc(firestore, "Rubros", data.Rubro.id);
    await editCount(rubroRef, "Variedades", "plus");

    if (file && res?.id && res.id !== undefined) {
      const docRef = doc(firestore, "Variedades", res.id);
      const path = `Variedades/${res.id}/imagen`;
      const fileRef = ref(storage, path);
      const snapShot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapShot.ref);
      await updateDoc(docRef, { Foto: { Url: url, Path: path } });
    }

    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

export const UpdateVariedad = async (
  data: Variedades,
  file: File | null,
  oldRubroId: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Variedades", data.id || "");
    const newData = {
      ...data,
      NombreLower: cleanString(data.Nombre),
      FechaCreacion: serverTimestamp(),
    };
    delete newData.id;

    if (file && data?.id) {
      const path = `Variedades/${data?.id}/imagen`;
      const fileRef = ref(storage, path);
      const snapShot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapShot.ref);
      newData.Foto = { Url: url, Path: path };
    }
    if (
      oldRubroId &&
      oldRubroId !== undefined &&
      data.Rubro.id !== oldRubroId
    ) {
      const oldrubroRef = doc(firestore, "Rubros", oldRubroId);
      await editCount(oldrubroRef, "Variedades", "minus");
      const newrubroRef = doc(firestore, "Rubros", data.Rubro.id);
      await editCount(newrubroRef, "Variedades", "plus");
    }
    await updateDoc(docRef, newData);

    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

export const DeleteVariedad = async (
  id: string,
  rubroId: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Variedades", id);
    const path = `Variedades/${id}/imagen`;
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    const rubroRef = doc(firestore, "Rubros", rubroId);
    await editCount(rubroRef, "Variedades", "minus");
    const countRef = doc(firestore, "Contadores", "Variedades");
    await editCount(countRef, "count", "minus");
    await deleteDoc(docRef);
    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};
