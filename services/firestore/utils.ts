import {
  DocumentData,
  DocumentReference,
  endAt,
  getDoc,
  increment,
  query,
  Query,
  setDoc,
  startAt,
  updateDoc,
  where,
} from "firebase/firestore";
import { cleanString } from "../../utils/utils";

export const editCount = async (
  ref: DocumentReference<DocumentData>,
  fieldName: string = "",
  type: "plus" | "minus"
) => {
  const docSnapshot = await getDoc(ref);

  if (docSnapshot.exists()) {
    const data = {
      [fieldName]: increment(type === "plus" ? 1 : -1),
    };
    return updateDoc(ref, data);
  } else {
    const data = {
      [fieldName]: type === "plus" ? 1 : 0,
    };
    return setDoc(ref, data);
  }
};

export const querySorter = (q: Query<DocumentData>, filter: any) => {
  Object.keys(filter).forEach((key) => {
    const value = filter[key];

    if (key === "endAt") {
      const miliDate = Date.parse(value);
    } else if (key === "startAt") {
      const miliDate = Date.parse(value);
    } else if (key === "FechaCreacion") {
      // const miliDate = Date.parse(value);
      // console.log(value);

      q = query(q, where(key, ">=", value[0]));
      q = query(q, where(key, "<=", value[1]));
    } else {
      if (
        // Object.keys(filter).length === 1 &&
        key.includes("Nombre_lower") ||
        key.includes("NombreLower") ||
        key.includes("Apellido_lower") ||
        key.includes("ApellidoLower")
      ) {
        if (Object.keys(filter).length === 1) {
          console.log("search val", value);

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
      // if (
      //   // Object.keys(filter).length === 1 &&
      //   key.includes("Nombre_lower") ||
      //   key.includes("NombreLower") ||
      //   key.includes("Apellido_lower") ||
      //   key.includes("ApellidoLower")
      // ) {
      //   q = query(q, where(key, "==", cleanString(value)));
      // } else {
      //   q = query(q, where(key, "==", value));
      // }
    }
  });

  return q;
};
