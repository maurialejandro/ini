import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  Unsubscribe,
  User,
  updateEmail,
  updateProfile,
  reauthenticateWithCredential,
  AuthCredential,
  EmailAuthProvider,

} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../configs/firebase-client";
import { User as UserModel } from "../../models/User";
import { AuthProvider } from "../../components/context/AuthProvider";
import { credential } from "firebase-admin";

export const signInWithEmail = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return null;
  } catch (error: any) {
    console.log(error);
    return error?.code;
  }
};

export const getUserFirestore = async (id: string): Promise<UserModel> => {
  try {
    const docRef = doc(firestore, "Usuarios", id);
    const docData = await getDoc(docRef);

    return {
      Email: docData.data()?.Email,
      Permisos: docData.data()?.Permisos,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export const checkAuthCredentials  = async (userData: any) => {
  try {
    if(userData){
      if(auth.currentUser?.email === userData.Email){
        return "email-coincide";
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const recoverPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return null;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const signOutSession = async () => {
  try {
    await signOut(auth);
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

type Callback = (user: User | null) => void;

let listener: Unsubscribe;

export const validateSesion = (callback: Callback) => {
  listener = auth.onAuthStateChanged(callback, console.error);
};
