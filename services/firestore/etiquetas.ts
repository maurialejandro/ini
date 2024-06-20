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
  QuerySnapshot,
  serverTimestamp,
  startAfter,
  startAt,
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
import { Etiquetas } from "../../models/Etiquetas";
import { cleanString } from "../../utils/utils";
import { editCount } from "./utils";

const storage = getStorage();

export const GetCountEtiquetas = async (
  rubroId: string,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<number> => {
  try {
    if (
      filter &&
      filter !== undefined &&
      Object.keys(filter).length !== 0 &&
      Object.keys(filter).length !== 0
    ) {
      const collectionRef = collection(firestore, "Etiquetas");
      let q: Query<DocumentData> = query(
        collectionRef,
        orderBy(sortBy, sortOrder),
        where("Rubro.id", "==", rubroId)
      );

      if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
        q = querySorter(q, filter);
      }

      const docsSnap = await getDocs(q);
      return docsSnap.docs.length;
    } else {
      // const ref = doc(firestore, "Contadores", "Etiquetas");
      // const snap = await getDoc(ref);
      const collectionRef = collection(firestore, "Etiquetas");
      let q: Query<DocumentData> = query(
        collectionRef,
        orderBy(sortBy, sortOrder),
        where("Rubro.id", "==", rubroId)
      );
      const docsSnap = await getDocs(q);
      if (docsSnap) {
        return docsSnap.size || 0;
      } else {
        return 0;
      }
    }
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const GetEtiquetas = async (
  rubroId: string,
  rowsPerPage: number = 10,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "asc",
  filter?: any
): Promise<{
  data: Etiquetas[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Etiquetas");

    let docsSnap: QuerySnapshot<DocumentData>;

    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder)
    );

    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
      if (
        Object.keys(filter).length === 1 &&
        String(Object.keys(filter)[0]).includes("NombreLower")
      ) {
        /////////////////////////////////////////////////////////////
        // Special query only used when only filter "Nombre" is used

        const value = String(Object.values(filter)[0]);

        let q2: Query<DocumentData> = query(
          collectionRef,
          orderBy("NombreLower")
        );

        q2 = query(
          q2,
          startAt(cleanString(value)),
          endAt(cleanString(value) + "\uf8ff")
        );

        q2 = query(q2, where("Rubro.id", "==", rubroId), limit(rowsPerPage));

        docsSnap = await getDocs(q2);
      } else {
        q = querySorter(q, filter);

        q = query(q, where("Rubro.id", "==", rubroId), limit(rowsPerPage));

        docsSnap = await getDocs(q);
      }
    } else {
      q = query(q, where("Rubro.id", "==", rubroId), limit(rowsPerPage));

      docsSnap = await getDocs(q);
    }

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
export const GetRangeEtiquetas = async (
  rubroId: string,
  range?: number
): Promise<Etiquetas | string> => {
  try {
    const collectionRef = collection(firestore, "Etiquetas");

    let docsSnap: QuerySnapshot<DocumentData>;

    let q: Query<DocumentData> = query(
      collectionRef,
      where("Rubro.id", "==", rubroId)
    );

    if (range) {
      q = query(q, where("Rango.min", "<=", range));
      docsSnap = await getDocs(q);

      const data: any[] = docsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const data2 = data.filter((doc: any) => range <= doc.Rango.max);

      if (data2.length === 1) {
        return data2[0];
      } else {
        return "error";
      }
    } else {
      return "error";
    }
  } catch (error) {
    console.log(error);
    // throw error;
    return "error";
  }
};

export const GetAllEtiquetas = async (
  rubroId: string,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "asc"
): Promise<Etiquetas[] | string> => {
  try {
    const collectionRef = collection(firestore, "Etiquetas");

    let docsSnap: QuerySnapshot<DocumentData>;

    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      where("Rubro.id", "==", rubroId)
    );

    docsSnap = await getDocs(q);

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

export const GetMoreEtiquetas = async (
  rubroId: string,
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Etiquetas[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Etiquetas");
    let q: Query<DocumentData> = query(
      collectionRef,
      orderBy(sortBy, sortOrder),
      where("Rubro.id", "==", rubroId),
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

export const CreateEtiqueta = async (
  data: Etiquetas,
  file: File | null
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const newData: any = {
      ...data,
      NombreLower: cleanString(data.Nombre),
      FechaCreacion: serverTimestamp(),
    };
    delete newData.id;

    const rubroId: string = data.Rubro.id || "";

    const validation = await ValidateUnused(data, rubroId);
    // if (true)
    if (validation.finded !== 0)
      return { code: "Error", payload: validation.msg };

    const res = await addDoc(collection(firestore, "Etiquetas"), newData);
    const countRef = doc(firestore, "Contadores", "Etiquetas");
    await editCount(countRef, "count", "plus");
    const rubroRef = doc(firestore, "Rubros", rubroId);
    await editCount(rubroRef, "Etiquetas", "plus");

    if (file && res?.id && res.id !== undefined) {
      const docRef = doc(firestore, "Etiquetas", res.id);
      const path = `Etiquetas/${res.id}/imagen`;
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

export const UpdateEtiqueta = async (
  data: Etiquetas,
  file: File | null,
  oldRubroId: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Etiquetas", data.id || "");
    const newData = {
      ...data,
      NombreLower: cleanString(data.Nombre),
      FechaCreacion: serverTimestamp(),
    };
    delete newData.id;

    const rubroId: string = data.Rubro.id || "";

    const validation = await ValidateUnused(data, rubroId);
    if (validation.finded !== 0)
      return { code: "Error", payload: validation.msg };

    if (file && data?.id) {
      const path = `Etiquetas/${data?.id}/imagen`;
      const fileRef = ref(storage, path);
      const snapShot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapShot.ref);
      newData.Foto = { Url: url, Path: path };
    }
    if (oldRubroId && oldRubroId !== undefined && rubroId !== oldRubroId) {
      const oldrubroRef = doc(firestore, "Rubros", oldRubroId);
      await editCount(oldrubroRef, "Etiquetas", "minus");
      const newrubroRef = doc(firestore, "Rubros", rubroId);
      await editCount(newrubroRef, "Etiquetas", "plus");
    }
    await updateDoc(docRef, newData);

    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

export const DeleteEtiqueta = async (
  id: string,
  rubroId: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Etiquetas", id);
    const path = `Etiquetas/${id}/imagen`;
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    const rubroRef = doc(firestore, "Rubros", rubroId);
    await editCount(rubroRef, "Etiquetas", "minus");
    const countRef = doc(firestore, "Contadores", "Etiquetas");
    await editCount(countRef, "count", "minus");
    await deleteDoc(docRef);
    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

const ValidateUnused = async (
  data: Etiquetas,
  rubroId: string
): Promise<{ finded: number; msg: string }> => {
  const position = data.Posicion as number;
  const minGrades = data.Rango?.min as number;
  const maxGrades = data.Rango?.max as number;
  const current: string = data?.id as string;

  const collectionRef = collection(firestore, "Etiquetas");

  if (
    position &&
    position !== undefined &&
    minGrades &&
    minGrades !== undefined &&
    maxGrades &&
    maxGrades !== undefined
  ) {
    const queryA: Query<DocumentData> = query(
      collectionRef,
      where("Posicion", "==", position),
      where("Rubro.id", "==", rubroId)
    );

    const snapA = await getDocs(queryA);

    if (snapA.docs.length > 1) {
      console.log("somewhere here");
      return { finded: 1, msg: "Posicion en uso" };
    } else {
      const queryB = query(
        collectionRef,
        where("Rango.min", ">=", minGrades),
        where("Rubro.id", "==", rubroId)
      );

      const snapB = await getDocs(queryB);

      const allDocs: Etiquetas[] = snapB.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as any[];

      const rangeDocs = allDocs.filter((doc) => maxGrades >= doc!.Rango!.min);

      console.log("somewhere here... ", rangeDocs);
      if (rangeDocs.length === 0) {
        return { finded: 0, msg: "valid" };
        // return { finded: 1, msg: "valid" };
      } else if (rangeDocs.length === 1) {
        if (rangeDocs[0].id === current) {
          return { finded: 0, msg: "valid" };
          // return { finded: 1, msg: "valid" };
        } else {
          return { finded: 1, msg: "Rango en uso" };
        }
      } else {
        return { finded: 1, msg: "Rango en uso" };
      }
    }
  } else {
    return { finded: 1, msg: "Valores invalidos" };
  }

  // if (
  //   position &&
  //   position !== undefined &&
  //   minGrades &&
  //   minGrades !== undefined &&
  //   maxGrades &&
  //   maxGrades !== undefined
  // ) {
  //   // console.log(minGrades, maxGrades);

  //   const collectionRef = collection(firestore, "Etiquetas");
  //   const query1: Query<DocumentData> = query(
  //     collectionRef,
  //     where("Posicion", "==", position),
  //     where("Rubro.id", "==", rubroId)
  //   );
  //   const searchSnap1 = await getDocs(query1);
  //   if (searchSnap1.docs.length !== 0) {
  //     if (searchSnap1.docs[0].id === current && searchSnap1.docs.length === 1) {
  //       return { finded: 0, msg: "" };
  //     } else return { finded: searchSnap1.docs.length, msg: "Posicion en uso" };
  //   } else {
  //     const query2 = query(
  //       collectionRef,
  //       where("Rango.min", "<=", minGrades),
  //       where("Rubro.id", "==", rubroId)
  //     );
  //     const halfSearch = await getDocs(query2);
  //     const docs1: any = halfSearch.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     }));
  //     console.log(docs1);
  //     const docs2 = docs1.filter((doc: any) => maxGrades <= doc.Rango.max);
  //     // console.log(docs2);
  //     if (docs2.id === current && docs2.length === 1) {
  //       return { finded: 0, msg: "" };
  //     } else return { finded: docs2.length, msg: "Posicion en uso" };
  //   }
  // } else {
  //   return { finded: 0, msg: "" };
  // }
};

const querySorter = (q: Query<DocumentData>, filter: any) => {
  Object.keys(filter).forEach((key) => {
    const value = filter[key];

    if (key === "endAt") {
      const miliDate = Date.parse(value);
    } else if (key === "startAt") {
      const miliDate = Date.parse(value);
    } else {
      if (
        // Object.keys(filter).length === 1 &&
        key.includes("Nombre_lower") ||
        key.includes("NombreLower") ||
        key.includes("Apellido_lower") ||
        key.includes("ApellidoLower")
      ) {
        if (Object.keys(filter).length === 1) {
          q = query(
            q,
            // orderBy("NombreLower"),
            startAt(cleanString(value)),
            endAt(cleanString(value) + "\uf8ff")
          );

          // q = query(q, where(key, "==", cleanString(value)));
        } else {
          q = query(q, where(key, "==", cleanString(value)));
        }
      } else {
        q = query(q, where(key, "==", value));
      }
    }
  });

  return q;
};
