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
  QueryConstraint,
  QueryDocumentSnapshot,
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
import { Rubro } from "../../models/Rubro";
import { cleanString } from "../../utils/utils";
import { querySorter } from "./utils";

const storage = getStorage();

const orderFiltered = (
  order: string,
  sortOrder: "asc" | "desc"
): QueryConstraint => {
  if (order === "FechaCreacion") return orderBy(order);
  else if (order === "NombreLower") return orderBy(order);
  return orderBy(order, sortOrder);
};

export const GetCountRubros = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<number> => {
  try {
    if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
      const collectionRef = collection(firestore, "Rubros");
      let order = sortBy;
      if (filter && "FechaCreacion" in filter) {
        order = "FechaCreacion";
      }
      let q: Query<DocumentData> = query(
        collectionRef,
        orderFiltered(order, sortOrder)
      );

      if (filter && filter !== undefined && Object.keys(filter).length !== 0) {
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

export const GetRubros = async (
  rowsPerPage: number = 10,
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Rubro[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Rubros");
    let order = sortBy;
    if (filter && "FechaCreacion" in filter) {
      order = "FechaCreacion";
    }
    console.log("order--", order);
    console.log("filter--", filter);

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

export const GetAllRubros = async (
  sortBy: string = "NombreLower",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Rubro[] | string> => {
  try {
    const collectionRef = collection(firestore, "Rubros");
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
    // throw error;
  }
};

export const GetRubros2 = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Rubro[]> => {
  try {
    const q = query(
      collection(firestore, "Rubros"),
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

export const GetMoreRubros = async (
  latestDoc: QueryDocumentSnapshot<DocumentData>,
  rowsPerPage: number = 10,
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  filter?: any
): Promise<{
  data: Rubro[];
  lastDoc: QueryDocumentSnapshot<DocumentData>;
}> => {
  try {
    const collectionRef = collection(firestore, "Rubros");
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

// export const GetAllRubros = async (
//   sortBy: string = "Nombre",
//   sortOrder: "asc" | "desc" = "desc",
//   max: number = 10
// ): Promise<Rubro[]> => {
//   try {
//     const q = query(
//       collection(firestore, "Rubros"),
//       orderBy(sortBy, sortOrder),
//       limit(max)
//     );

//     return (await getDocs(q)).docs.map((doc: any) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

export const CreateRubro = async (
  data: Rubro,
  file: File | null
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const newData: any = {
      ...data,
      NombreLower: cleanString(data.Nombre),
      FechaCreacion: serverTimestamp(),
      Variedades: 0,
      Etiquetas: 0,
    };
    delete newData.id;
    const res = await addDoc(collection(firestore, "Rubros"), newData);

    if (file && res?.id) {
      const docRef = doc(firestore, "Rubros", res.id);
      const path = `rubros/${res.id}/imagen`;
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

export const UpdateRubro = async (
  data: Rubro,
  file: File | null
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Rubros", data.id || "");
    const newData = {
      ...data,
      NombreLower: cleanString(data.Nombre),
    };
    delete newData.id;

    if (file) {
      const path = `rubros/${data?.id}/imagen`;
      const fileRef = ref(storage, path);
      const snapShot = await uploadBytes(fileRef, file);
      const url = await getDownloadURL(snapShot.ref);
      newData.Foto = { Url: url, Path: path };
    }
    await updateDoc(docRef, newData);

    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};
export const DeleteRubro = async (
  id: string
): Promise<{ code: "Ok" | "Error"; payload?: string }> => {
  try {
    const docRef = doc(firestore, "Rubros", id);
    const path = `rubros/${id}/imagen`;
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    await deleteDoc(docRef);
    return { code: "Ok" };
  } catch (error) {
    console.log(error);
    return { code: "Error" };
  }
};

export const EndRubroSeason = async (
  id: string,
  rubro: string = ""
): Promise<"Ok" | "Error"> => {
  try {
    await addDoc(collection(firestore, "Temporadas"), {
      FechaTermino: serverTimestamp(),
      RubroId: id,
      Rubro: rubro
    });
    return "Ok";
  } catch (error) {
    console.log(error);
    return "Error";
  }
};

// export const deleteCondominio = async (target: Condominios): Promise<any> => {
//   try {
//     let batch = writeBatch(firestore);
//     const parcelasQuery = query(
//       collection(firestore, "Parcelas"),
//       where("Condominio.id", "==", target.id)
//     );
//     const parcelasResponse = await getDocs(parcelasQuery);
//     const parcelasArray: any[] = parcelasResponse.docs.map((doc) => ({
//       ...doc.data(),
//       id: doc.id,
//     }));
//     const usersIds: string[] = [];
//     parcelasArray.map((doc) => {
//       const parcelaRef = doc(firestore, "Parcelas", doc.id);
//       if (doc.Usuario) {
//         usersIds.push(doc.Usuario.id);
//       }
//       batch.delete(parcelaRef);
//     });
//     await batch.commit();
//     batch = writeBatch(firestore);
//     usersIds.map((userId) => {
//       const usuarioRef = doc(firestore, "Usuarios", userId);
//       batch.delete(usuarioRef);
//     });
//     await batch.commit();

//     await Promise.all(
//       usersIds.map(async (userId) => {
//         // EXECUTE CLOUD FUNCTION DELETE USER AUTHENTICATION
//         console.log(userId);
//       })
//     );
//     if (target.Manager?.id) {
//       await deleteDoc(doc(firestore, "Usuarios", target.Manager?.id));
//       // EXECUTE CLOUD FUNCTION DELETE USER AUTHENTICATION
//     }
//     await deleteDoc(doc(firestore, "Condominios", target.id));
//     return "OK";
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };
