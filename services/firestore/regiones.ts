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
import { Regiones } from "../../models/Regiones";
 
export const getAllRegiones = async (
    sortBy: string = "Nombre",
    sortOrder: "asc" | "desc" = "desc",
    max: number = 15
) : Promise<Regiones[]> => {
    try {
        const regionesRef = collection(firestore, "Regiones");
        const queryRegiones = query(regionesRef, orderBy(sortBy, sortOrder), limit(max));
        return (await getDocs(queryRegiones)).docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));
    } catch (error) {
        console.log(error);
        throw(error);
    }
}

export const getComunas = async (id: string) : Promise<any[]> => {
    try {
        const regionesRef = collection(firestore, "Regiones", id, "Comunas" );
        const queryComunas = query(regionesRef);
        return (await getDocs(queryComunas)).docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        }));
        
    } catch (error) {
        console.log(error);
        // throw(error);
        return []
    }
}