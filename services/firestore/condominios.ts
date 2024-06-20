import Axios from "axios";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { firestore } from "../../configs/firebase-client";
import { Condominios } from "../../models/Condominios";
import { UserManager } from "../../models/UserManager";

export const getAllCondominios = async (
  sortBy: string = "Nombre",
  sortOrder: "asc" | "desc" = "desc",
  max: number = 10
): Promise<Condominios[]> => {
  try {
    const q = query(
      collection(firestore, "Condominios"),
      orderBy(sortBy, sortOrder),
      limit(max)
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

export const getTotalCondominios = async (
  idManager?: string | null
): Promise<Condominios[]> => {
  try {
    const condominiosRef = collection(firestore, "Condominios");
    if (idManager) {
      const q = query(
        condominiosRef,
        where("Manager.id", "==", idManager),
        orderBy("Nombre", "desc")
      );
      return (await getDocs(q)).docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } else {
      const q = query(condominiosRef, orderBy("Nombre", "desc"));
      return (await getDocs(q)).docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createCondominio = async (
  dataCondominio: Condominios,
  dataManager: UserManager
): Promise<{ resCondominio: any; resUser: any }> => {
  try {
    const condominio: any = dataCondominio;
    delete condominio.id;
    const resCon = await addDoc(
      collection(firestore, "Condominios"),
      condominio
    );
    if (resCon.id) {
      const userQuery = query(
        collection(firestore, "Usuarios"),
        where("Email", "==", dataManager.Email)
      );
      const resUsers = await getDocs(userQuery);

      if (resUsers.docs.length > 0) {
        return { resCondominio: resCon, resUser: "UsedEmail" };
      }
      const resUser = await createUserCondominio(dataManager, resCon.id);
      return { resCondominio: resCon, resUser: resUser };
    } else {
      return { resCondominio: null, resUser: null };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteCondominio = async (target: Condominios): Promise<any> => {
  try {
    let batch = writeBatch(firestore);
    const parcelasQuery = query(
      collection(firestore, "Parcelas"),
      where("Condominio.id", "==", target.id)
    );
    const parcelasResponse = await getDocs(parcelasQuery);
    const parcelasArray: any[] = parcelasResponse.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const usersIds: string[] = [];
    parcelasArray.map((doc) => {
      const parcelaRef = doc(firestore, "Parcelas", doc.id);
      if (doc.Usuario) {
        usersIds.push(doc.Usuario.id);
      }
      batch.delete(parcelaRef);
    });
    await batch.commit();
    batch = writeBatch(firestore);
    usersIds.map((userId) => {
      const usuarioRef = doc(firestore, "Usuarios", userId);
      batch.delete(usuarioRef);
    });
    await batch.commit();

    await Promise.all(
      usersIds.map(async (userId) => {
        // EXECUTE CLOUD FUNCTION DELETE USER AUTHENTICATION
        console.log(userId);
      })
    );
    if (target.Manager?.id) {
      await deleteDoc(doc(firestore, "Usuarios", target.Manager?.id));
      // EXECUTE CLOUD FUNCTION DELETE USER AUTHENTICATION
    }
    await deleteDoc(doc(firestore, "Condominios", target.id));
    return "OK";
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCondominioName = async (
  newName: string,
  oldName: string,
  id: string
): Promise<any> => {
  try {
    const batch = writeBatch(firestore);
    if (newName !== oldName) {
      const condominioRef = doc(firestore, "Condominios", id);
      await updateDoc(condominioRef, {
        Nombre: newName,
      });

      /// UPDATE CONDOMINIO NAME FOR ALL PARCELAS
      const parcelasQuery = query(
        collection(firestore, "Parcelas"),
        where("Condominio.id", "==", id)
      );
      const parcelasResponse = await getDocs(parcelasQuery);
      const parcelasArray: any[] = parcelasResponse.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      parcelasArray.map((parcela) => {
        const parcelaRef = doc(firestore, "Parcelas", parcela.id);
        batch.update(parcelaRef, { "Condominio.Nombre": newName });
      });

      await batch.commit();

      return "OK";
    } else {
      return oldName;
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getManagerCondominio = async (
  id: string
): Promise<UserManager> => {
  try {
    const docRef = doc(firestore, "Usuarios", id);
    const docData = await getDoc(docRef);

    return {
      Nombre: docData.data()?.Nombre,
      Apellido: docData.data()?.Apellido,
      Email: docData.data()?.Email,
      Password: docData.data()?.Password,
      id: id,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createUserCondominio = async (
  user: UserManager,
  condominioId: string,
  oldUser?: string
) => {
  try {
    const batch = writeBatch(firestore);
    if (oldUser) {
      // ACTION DELETE OLD USER FROM AUTHENTICATION
      await Axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
        {
          idToken: oldUser,
          returnSecureToken: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    // BEST USING API, USING AUTH CAUSES RELOGGING AUTH WITH CREATED USER
    const authResponse = await Axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        email: user.Email,
        password: user.Password,
        returnSecureToken: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const ID = authResponse.data.localId;
    const data: any = user;

    delete data.id;

    const condominioRef = doc(firestore, "Condominios", condominioId);

    await setDoc(doc(firestore, "Usuarios", ID), {
      ...data,
      Permisos: "Manager",
    });
    await updateDoc(condominioRef, {
      Manager: { Nombre: data.Nombre + " " + data.Apellido, id: ID },
    });

    /// UPDATE CONDOMINIO MANAGER/PROPIETARIO FOR ALL PARCELAS
    const parcelasQuery = query(
      collection(firestore, "Parcelas"),
      where("Condominio.id", "==", condominioId)
    );
    const parcelasResponse = await getDocs(parcelasQuery);
    const parcelasArray: any[] = parcelasResponse.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    parcelasArray.map((parcela) => {
      const parcelaRef = doc(firestore, "Parcelas", parcela.id);
      batch.update(parcelaRef, {
        "Propietario.Nombre": data.Nombre,
        "Propietario.id": ID,
      });
    });

    await batch.commit();

    return { ...data, id: ID };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const updateUserCondominio = async (
  user: UserManager,
  userId: string,
  condominioId: string
) => {
  try {
    const batch = writeBatch(firestore);
    const data: any = user;
    delete data.id;

    const condominioRef = doc(firestore, "Condominios", condominioId);

    await updateDoc(doc(firestore, "Usuarios", userId), data);
    await updateDoc(condominioRef, {
      Manager: { Nombre: data.Nombre + " " + data.Apellido, id: userId },
    });

    /// UPDATE CONDOMINIO MANAGER/PROPIETARIO FOR ALL PARCELAS
    const parcelasQuery = query(
      collection(firestore, "Parcelas"),
      where("Condominio.id", "==", condominioId)
    );
    const parcelasResponse = await getDocs(parcelasQuery);
    const parcelasArray: any[] = parcelasResponse.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    parcelasArray.map((parcela) => {
      const parcelaRef = doc(firestore, "Parcelas", parcela.id);
      batch.update(parcelaRef, {
        "Propietario.Nombre": data.Nombre + " " + data.Apellido,
        "Propietario.id": userId,
      });
    });

    await batch.commit();

    return { ...user, id: userId };
  } catch (error) {
    console.log(error);
    return null;
  }
};
